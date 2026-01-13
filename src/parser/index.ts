export * from "./lexer";
export * from "./parser";
export * from "./ast";
export * from "./visitor";

import { tokenize } from "./lexer";
import { parse } from "./parser";
import { buildAst } from "./visitor";
import type { ExpressionConstraint } from "./ast";

/**
 * Parses ECL (Expression Constraint Language) text into an Abstract Syntax Tree.
 *
 * This is the main entry point for parsing ECL expressions. It performs lexical
 * analysis followed by parsing according to the ECL grammar specification, then
 * transforms the concrete syntax tree (CST) into an abstract syntax tree (AST).
 *
 * @param input - ECL expression string to parse
 * @returns Parse result containing:
 *   - `ast`: The parsed AST (null if parsing fails)
 *   - `errors`: Array of lexing/parsing errors (empty if successful)
 *
 * @example
 * ```typescript
 * // Simple concept reference
 * const result = parseEcl("404684003 |Clinical finding|");
 * if (result.errors.length === 0) {
 *   console.log("Parsed successfully:", result.ast);
 * }
 *
 * // Compound expression with refinement
 * const result2 = parseEcl(
 *   "(<< 404684003: 363698007 = << 39057004) AND << 987654321"
 * );
 * ```
 *
 * @see https://docs.snomed.org/snomed-ct-specifications/snomed-ct-expression-constraint-language
 */
export function parseEcl(input: string): {
  ast: ExpressionConstraint["expression"] | null;
  errors: any[];
} {
  const lexResult = tokenize(input);

  if (lexResult.errors.length > 0) {
    return { ast: null, errors: lexResult.errors };
  }

  const parseResult = parse(lexResult.tokens);

  if (parseResult.errors.length > 0) {
    return { ast: null, errors: parseResult.errors };
  }

  try {
    const ast = buildAst(parseResult.cst);
    return { ast, errors: [] };
  } catch (e) {
    return { ast: null, errors: [e] };
  }
}
