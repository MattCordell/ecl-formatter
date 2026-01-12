export * from "./lexer";
export * from "./parser";
export * from "./ast";
export * from "./visitor";

import { tokenize } from "./lexer";
import { parse } from "./parser";
import { buildAst } from "./visitor";
import type { ExpressionConstraint } from "./ast";

/**
 * Parse an ECL expression string into an AST
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
