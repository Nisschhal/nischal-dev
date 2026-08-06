# 0009 — Automated code review via a project-local agent

**Status:** Accepted · 2026-08-06

## Context

Changes to this repo should be reviewed against its own recorded decisions, not just
generic style rules. Several ADRs describe invariants that are easy to break by
accident and expensive to discover later — the data seam ([0008](./0008-data-access-seam.md))
in particular only pays off in Phase 2 if nothing reaches around it in the meantime.

Instructions in `CLAUDE.md` cannot enforce this: they are advisory, and an assistant
follows them only when it happens to. An action triggered by an *event* requires a
**hook**, which the harness executes unconditionally.

## Decision

A `Stop` hook runs `.claude/hooks/review-changes.sh` after each turn. The script
detects changed files and spawns the project-local agent at
`.claude/agents/code-reviewer.md` via `claude -p --agent code-reviewer --model sonnet`.

Everything lives in the repo and is version-controlled: the agent, the script, and the
hook wiring. `.claude/reviews/` (log + stamp) is local state and gitignored.

**Trigger — end of turn, not per edit.** Reviewing after every `Edit` fires ~15 times
per turn and inspects half-finished work: a file mid-refactor produces findings like
"this import is unused" when the usage simply isn't written yet. Batching to the end of
the turn gives one review of finished work.

**Advisory, never blocking.** `async: true` means the turn never waits.
`asyncRewake: true` surfaces findings back into context on exit code 2, so they are
reported rather than buried in a file nobody opens. A false positive costs a message,
not a stalled session.

**Read-only agent.** Frontmatter grants `Read, Grep, Glob` only. A reviewer that can
edit is a reviewer that can break the build unattended.

**Change detection by timestamp, not git.** The repo had no commits when this was
built, so `git diff HEAD` had no baseline. A stamp file plus `find -newer` works
regardless of commit habits. The stamp is touched *before* the review runs, so a
crashed reviewer cannot re-queue the same files every turn.

## Consequences

- The review standards are versioned alongside the code they judge. Changing an ADR
  and the reviewer's rule is one commit.
- `.claude/agents/` scales to more subagents — one Markdown file each, no wiring needed.
- Costs one Sonnet call per turn that touches `src/`, `docker/`, or `scripts/`. Turns
  that change nothing there exit in milliseconds and spend nothing.
- **Recursion hazard, guarded.** The spawned reviewer is itself a `claude` process in
  this directory and inherits this same Stop hook. Without the `CLAUDE_REVIEW_CHILD`
  check on line 1 of the script it would spawn its own reviewer indefinitely. Any edit
  to that script must preserve the guard.
- **Portability trap, hit during the build.** `timeout` is GNU coreutils and does not
  exist on stock macOS. The first version called it, the call failed, and the error
  handler swallowed the failure — the hook appeared installed but silently reviewed
  nothing. The script now probes for `gtimeout`/`timeout` and logs a
  `REVIEW FAILED` entry rather than exiting quietly. **A review harness that fails
  silently is worse than none**, because it manufactures false confidence.
- New `.claude/` files are not picked up by the settings watcher mid-session; `/hooks`
  or a restart is needed once.

## Revisit if

Review latency becomes annoying, or per-turn cost matters more than coverage. The
cheap lever is narrowing the watched paths in `TARGETS`; the next is dropping to Haiku,
at the cost of missing the architectural findings that motivated this.
