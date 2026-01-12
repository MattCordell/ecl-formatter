/**
 * Pure formatting function for ECL (no VS Code dependency)
 */

import { parseEcl } from "../parser";
import { print } from "./printer";
import { FormattingOptions, defaultOptions } from "./rules";

/**
 * Format ECL text and return the formatted result
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
