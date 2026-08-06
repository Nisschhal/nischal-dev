#!/usr/bin/env bash
#
# Stop hook: review files changed during the turn just finished.
# See decisions/0009-automated-code-review.md
#
#   exit 0  nothing to review, or review came back clean  -> silent
#   exit 2  findings -> asyncRewake surfaces them back to Claude
#
# Runs async, so the turn never waits on it.

set -uo pipefail

# ── Recursion guard — MUST be first ──────────────────────────────────────────
# The reviewer below is itself a `claude` process launched in this directory, so
# it inherits this same Stop hook. Without this check it would spawn its own
# reviewer, forever, burning quota with nobody watching.
if [ -n "${CLAUDE_REVIEW_CHILD:-}" ]; then
  exit 0
fi

cd "$(dirname "${BASH_SOURCE[0]}")/../.." || exit 0

STATE_DIR=".claude/reviews"
STAMP="$STATE_DIR/.last-review"
LOG="$STATE_DIR/history.md"
mkdir -p "$STATE_DIR" || exit 0

# Nothing to do if the reviewer isn't installed.
command -v claude >/dev/null 2>&1 || exit 0
[ -f ".claude/agents/code-reviewer.md" ] || exit 0

# ── What changed? ────────────────────────────────────────────────────────────
# A stamp file rather than `git diff`: this repo may have no commits, and this
# keeps working regardless of commit habits.
TARGETS=()
for p in src docker scripts astro.config.mjs docker-compose.yml docker-compose.phase2.yml; do
  [ -e "$p" ] && TARGETS+=("$p")
done
[ ${#TARGETS[@]} -eq 0 ] && exit 0

FIND_ARGS=(-type f)
[ -f "$STAMP" ] && FIND_ARGS+=(-newer "$STAMP")

FILES=$(find "${TARGETS[@]}" "${FIND_ARGS[@]}" 2>/dev/null \
  | grep -vE 'node_modules|/dist/|\.astro/|github-cache\.json|\.DS_Store' \
  | head -40)

# Silent no-op is the common case — most turns change nothing under these paths.
[ -z "$FILES" ] && exit 0

# Stamp BEFORE reviewing. If the reviewer crashes or times out, the same files
# must not queue up for review again on every subsequent turn.
touch "$STAMP"

COUNT=$(printf '%s\n' "$FILES" | wc -l | tr -d ' ')

# ── Review ───────────────────────────────────────────────────────────────────
PROMPT="Review the following changed files against the standards in your agent
definition. Read each file before judging it.

$FILES

Report only findings that meet the bar described in your instructions. If nothing
meets it, output REVIEW_CLEAN and nothing else."

# `timeout` is GNU coreutils and is NOT present on stock macOS; `gtimeout` exists
# only if coreutils is brew-installed. Probe for one, and run unbounded if neither
# is there — the hook's own `timeout: 300` in settings.json still bounds it when
# invoked by the harness.
TIMEOUT_BIN=""
for c in gtimeout timeout; do
  command -v "$c" >/dev/null 2>&1 && { TIMEOUT_BIN="$c"; break; }
done

ERRFILE=$(mktemp)
if [ -n "$TIMEOUT_BIN" ]; then
  OUT=$(CLAUDE_REVIEW_CHILD=1 "$TIMEOUT_BIN" 240 claude -p \
    --agent code-reviewer --model sonnet "$PROMPT" 2>"$ERRFILE")
else
  OUT=$(CLAUDE_REVIEW_CHILD=1 claude -p \
    --agent code-reviewer --model sonnet "$PROMPT" 2>"$ERRFILE")
fi
RC=$?
ERR=$(head -c 500 "$ERRFILE"); rm -f "$ERRFILE"

# A broken reviewer must not fail silently — that turns this whole thing off with
# nobody noticing. Record it, but still exit 0 so it never blocks the turn.
if [ $RC -ne 0 ] || [ -z "$OUT" ]; then
  printf '\n---\n\n## %s — REVIEW FAILED (rc=%s)\n\n    %s\n' \
    "$(date '+%Y-%m-%d %H:%M')" "$RC" "${ERR:-no stderr}" >>"$LOG"
  exit 0
fi

# Clean result: no log entry, no notification.
if printf '%s' "$OUT" | grep -q 'REVIEW_CLEAN'; then
  exit 0
fi

# ── Findings ─────────────────────────────────────────────────────────────────
{
  printf '\n---\n\n## %s — %s file(s) reviewed\n\n' "$(date '+%Y-%m-%d %H:%M')" "$COUNT"
  printf '%s\n' "$FILES" | sed 's/^/    /'
  printf '\n%s\n' "$OUT"
} >>"$LOG"

printf '%s\n\n(also appended to %s)\n' "$OUT" "$LOG"
exit 2
