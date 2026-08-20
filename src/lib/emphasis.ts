/**
 * Tiny inline-emphasis convention for prose held in `profile.ts`.
 *
 * Copy there is plain strings, which keeps the data file readable and free of
 * markup — but a page of unbroken monospace is genuinely hard to scan. This
 * lets a phrase be marked with *asterisks* and rendered as `<strong>`, without
 * turning the bio into HTML.
 *
 * Escaping runs BEFORE the marker substitution, so the output is safe to hand
 * to `set:html` even though nothing here is user input today.
 */

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

/**
 * Escape HTML, then turn `*phrase*` into `<strong class="em">phrase</strong>`.
 *
 * The emphasis span deliberately inherits `color`. On /about these paragraphs
 * sit inside a `background-clip: text` scroll reveal, and any element that sets
 * its own colour paints over that clipped background — so a coloured `<strong>`
 * would stay lit inside the ghosted region and break the effect. Weight is the
 * one axis that survives it.
 */
export function emphasize(text: string): string {
  const escaped = text.replace(/[&<>"]/g, (c) => ESCAPES[c]);
  return escaped.replace(
    /\*([^*]+)\*/g,
    '<strong class="em">$1</strong>'
  );
}
