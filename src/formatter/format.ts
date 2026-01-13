/**
 * Pure formatting function for ECL (no VS Code dependency)
 */

import { parseEcl } from "../parser";
import { print } from "./printer";
import { FormattingOptions, defaultOptions } from "./rules";

/**
 * Formats ECL expression text with intelligent line breaking and indentation.
 *
 * This is the main entry point for formatting. It parses the input, applies
 * formatting rules based on expression complexity, and returns formatted text
 * or an error message.
 *
 * @param text - ECL expression string to format
 * @param options - Formatting options (defaults to 2-space indentation)
 * @returns Result object containing:
 *   - `formatted`: Formatted ECL string (null if formatting fails)
 *   - `error`: Error message (null if successful)
 *
 * @example
 * ```typescript
 * const result = formatEcl("<< 404684003:363698007=<< 39057004");
 * if (result.error === null) {
 *   console.log(result.formatted);
 *   // Output: << 404684003: 363698007 = << 39057004
 * }
 * ```
 *
 * @remarks
 * - Formatting is idempotent (formatting twice produces the same result)
 * - Complex expressions are broken across multiple lines
 * - Empty input returns an error
 */
export function formatEcl(
  text: string,
  options: FormattingOptions = defaultOptions
): { formatted: string | null; error: string | null } {
  const trimmed = text.trim();

  if (!trimmed) {
    return { formatted: null, error: "Empty input" };
  }

  const result = parseEcl(trimmed);

  if (result.errors.length > 0 || !result.ast) {
    // Return null to preserve original on parse errors
    const errorMsg = result.errors[0]?.message || "Parse error";
    return { formatted: null, error: errorMsg };
  }

  try {
    const formatted = print(result.ast, options, 0);
    return { formatted, error: null };
  } catch (e) {
    return { formatted: null, error: String(e) };
  }
}
