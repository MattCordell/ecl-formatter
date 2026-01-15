/**
 * AST Pretty Printer for ECL expressions
 */

import * as ast from "../parser/ast";
import {
  FormattingOptions,
  defaultOptions,
  isComplex,
  shouldBreakCompound,
  shouldBreakRefinement,
  shouldBreakAttributeGroup,
} from "./rules";

/**
 * Converts an ECL AST node into formatted text.
 *
 * This is the core pretty-printer that traverses the AST and generates
 * formatted ECL text according to formatting rules. Uses complexity detection
 * to decide when to break expressions across multiple lines.
 *
 * @param node - AST node to print
 * @param options - Formatting options (defaults to 2-space indentation)
 * @param indent - Current indentation level (internal, defaults to 0)
 * @param column - Current column position on the line (for alignment, defaults to indent)
 * @returns Formatted ECL string representation of the AST node
 *
 * @throws Error if unknown AST node type is encountered
 *
 * @example
 * ```typescript
 * const ast: ast.SubExpression = {
 *   type: "SubExpression",
 *   focusConcept: { type: "ConceptReference", sctId: "404684003" }
 * };
 * const formatted = print(ast, { indentSize: 2 });
 * // Output: "404684003"
 * ```
 */
export function print(
  node: ast.AstNode,
  options: FormattingOptions = defaultOptions,
  indent: number = 0,
  column: number = indent
): string {
  switch (node.type) {
    case "CompoundExpression":
      return printCompound(node as ast.CompoundExpression, options, indent, column);

    case "RefinedExpression":
      return printRefined(node as ast.RefinedExpression, options, indent, column);

    case "SubExpression":
      return printSubExpression(node as ast.SubExpression, options, indent, column);

    case "ConceptReference":
      return printConceptReference(node as ast.ConceptReference);

    case "WildcardConcept":
      return "*";

    case "AlternateIdentifier":
      return printAlternateIdentifier(node as ast.AlternateIdentifier);

    case "NestedExpression":
      return printNestedExpression(node as ast.NestedExpression, options, indent, column);

    case "ConstraintOperator":
      return printConstraintOperator(node as ast.ConstraintOperator);

    case "Refinement":
      return printRefinement(node as ast.Refinement, options, indent, column);

    case "AttributeGroup":
      return printAttributeGroup(node as ast.AttributeGroup, options, indent, column);

    case "Attribute":
      return printAttribute(node as ast.Attribute, options, indent, column);

    case "DottedAttributePath":
      return printDottedAttributePath(node as ast.DottedAttributePath, options, indent, column);

    case "Cardinality":
      return printCardinality(node as ast.Cardinality);

    case "Filter":
      return printFilter(node as ast.Filter, options, indent, column);

    case "StringValue":
      return `"${(node as ast.StringValue).value}"`;

    case "NumberValue":
      return String((node as ast.NumberValue).value);

    case "BooleanValue":
      return (node as ast.BooleanValue).value ? "true" : "false";

    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}

function printCompound(
  node: ast.CompoundExpression,
  options: FormattingOptions,
  indent: number,
  column: number
): string {
  const shouldBreak = shouldBreakCompound(node);
  const leftStr = print(node.left as ast.AstNode, options, indent, column);

  if (shouldBreak) {
    const spaces = " ".repeat(indent);

    // Special case: if right is a SubExpression with NestedExpression as focusConcept,
    // keep operator with opening paren to avoid lonely operator on a line
    if (
      node.right.type === "SubExpression" &&
      !node.right.constraintOperator &&
      !node.right.filters &&
      node.right.focusConcept.type === "NestedExpression"
    ) {
      const nestedExpr = node.right.focusConcept as ast.NestedExpression;
      // Opening paren is at position: indent + operator.length
      // Content should be indented by 2 spaces from the opening paren
      const parenColumn = indent + node.operator.length;
      const contentIndent = parenColumn + options.indentSize;
      const innerStr = print(nestedExpr.expression as ast.AstNode, options, contentIndent, contentIndent);
      // Closing paren must align with opening paren (after the operator)
      const closingSpaces = " ".repeat(parenColumn);
      return `${leftStr}\n${spaces}${node.operator}(\n${" ".repeat(contentIndent)}${innerStr}\n${closingSpaces})`;
    }

    // Put operator and right operand on the same line
    const operatorColumn = indent + node.operator.length + 1; // +1 for space after operator
    const rightStr = print(node.right as ast.AstNode, options, indent, operatorColumn);
    return `${leftStr}\n${spaces}${node.operator} ${rightStr}`;
  } else {
    const leftLength = leftStr.length;
    const rightColumn = column + leftLength + 1 + node.operator.length + 1; // +1 for spaces
    const rightStr = print(node.right as ast.AstNode, options, indent, rightColumn);
    return `${leftStr} ${node.operator} ${rightStr}`;
  }
}

function printRefined(
  node: ast.RefinedExpression,
  options: FormattingOptions,
  indent: number,
  column: number
): string {
  const exprStr = print(node.expression, options, indent, column);
  const shouldBreak = shouldBreakRefinement(node.refinement);

  if (shouldBreak) {
    const nextIndent = indent + options.indentSize;
    const refinementStr = printRefinement(node.refinement, options, nextIndent, nextIndent);
    return `${exprStr}:\n${refinementStr}`;
  } else {
    const exprLength = exprStr.length;
    const refinementColumn = column + exprLength + 2; // +2 for ": "
    const refinementStr = printRefinement(node.refinement, options, indent, refinementColumn);
    return `${exprStr}: ${refinementStr}`;
  }
}

function printSubExpression(
  node: ast.SubExpression,
  options: FormattingOptions,
  indent: number,
  column: number
): string {
  let result = "";
  let currentColumn = column;

  if (node.constraintOperator) {
    const op = printConstraintOperator(node.constraintOperator);
    result += op + " ";
    currentColumn += op.length + 1;
  }

  const focusStr = print(node.focusConcept as ast.AstNode, options, indent, currentColumn);
  result += focusStr;
  currentColumn += focusStr.length;

  if (node.filters && node.filters.length > 0) {
    for (const filter of node.filters) {
      const filterStr = printFilter(filter, options, indent, currentColumn + 1);
      result += " " + filterStr;
      currentColumn += 1 + filterStr.length;
    }
  }

  return result;
}

function printConceptReference(node: ast.ConceptReference): string {
  if (node.term) {
    return `${node.sctId} |${node.term}|`;
  }
  return node.sctId;
}

function printAlternateIdentifier(node: ast.AlternateIdentifier): string {
  // If code contains special characters, quote it
  if (/[^a-zA-Z0-9_-]/.test(node.code)) {
    return `${node.scheme}#"${node.code}"`;
  }
  return `${node.scheme}#${node.code}`;
}

function printNestedExpression(
  node: ast.NestedExpression,
  options: FormattingOptions,
  indent: number,
  column: number
): string {
  // Check if the inner expression is complex
  const innerIsComplex = isComplex(node.expression as ast.AstNode);

  if (!innerIsComplex) {
    // Simple expression - keep on one line
    const innerColumn = column + 1; // After opening paren
    const innerStr = print(node.expression as ast.AstNode, options, indent, innerColumn);
    return `(${innerStr})`;
  }

  // Complex expression - break across lines
  // Content is indented based on what it contains:
  // - Lines with only opening paren: indent 1 space from opening paren
  // - Lines with content: indent 2 spaces (full indent) from opening paren

  // Check if inner expression starts with just an opening paren (no content on same line)
  const innerStartsWithParen =
    node.expression.type === "SubExpression" &&
    !node.expression.constraintOperator &&
    !node.expression.filters &&
    node.expression.focusConcept.type === "NestedExpression";

  let contentIndent: number;
  let contentColumn: number;

  if (innerStartsWithParen) {
    // Line contains only opening paren - indent 1 space
    contentIndent = column + 1;
    contentColumn = contentIndent;
  } else {
    // Line contains content - indent 2 spaces (full indent)
    contentIndent = column + options.indentSize;
    contentColumn = contentIndent;
  }

  const innerStr = print(node.expression as ast.AstNode, options, contentIndent, contentColumn);

  // Closing paren aligns with opening paren
  const closingSpaces = " ".repeat(column);
  return `(\n${" ".repeat(contentColumn)}${innerStr}\n${closingSpaces})`;
}

function printConstraintOperator(node: ast.ConstraintOperator): string {
  // Use brief syntax for operators
  switch (node.operator) {
    case "descendantOf":
      return "<";
    case "descendantOrSelfOf":
      return "<<";
    case "childOf":
      return "<!";
    case "childOrSelfOf":
      return "<<!";
    case "ancestorOf":
      return ">";
    case "ancestorOrSelfOf":
      return ">>";
    case "parentOf":
      return ">!";
    case "parentOrSelfOf":
      return ">>!";
    case "memberOf":
      return "^";
    default:
      return node.operator;
  }
}

function printRefinement(
  node: ast.Refinement,
  options: FormattingOptions,
  indent: number,
  column: number
): string {
  const spaces = " ".repeat(indent);
  const shouldBreak = shouldBreakRefinement(node);

  if (shouldBreak) {
    const parts: string[] = [];
    for (let i = 0; i < node.items.length; i++) {
      const itemStr = print(node.items[i] as ast.AstNode, options, indent, indent);
      parts.push(spaces + itemStr);
    }

    // Join with conjunctions
    let result = parts[0];
    for (let i = 1; i < parts.length; i++) {
      const conj = node.conjunctions[i - 1] || ",";
      result += `${conj === "," ? "," : " " + conj}\n${parts[i]}`;
    }
    return result;
  } else {
    let currentColumn = column;
    const parts: string[] = [];
    for (let i = 0; i < node.items.length; i++) {
      const itemStr = print(node.items[i] as ast.AstNode, options, indent, currentColumn);
      parts.push(itemStr);
      currentColumn += itemStr.length;

      if (i < node.items.length - 1) {
        const conj = node.conjunctions[i] || ",";
        const conjStr = conj === "," ? ", " : " " + conj + " ";
        currentColumn += conjStr.length;
      }
    }

    // Join with conjunctions
    let result = parts[0];
    for (let i = 1; i < parts.length; i++) {
      const conj = node.conjunctions[i - 1] || ",";
      result += `${conj === "," ? ", " : " " + conj + " "}${parts[i]}`;
    }
    return result;
  }
}

function printAttributeGroup(
  node: ast.AttributeGroup,
  options: FormattingOptions,
  indent: number,
  column: number
): string {
  const shouldBreak = shouldBreakAttributeGroup(node);

  let cardinalityStr = "";
  if (node.cardinality) {
    cardinalityStr = printCardinality(node.cardinality) + " ";
  }

  if (shouldBreak) {
    const innerIndent = indent + options.indentSize;
    const innerSpaces = " ".repeat(innerIndent);
    const parts: string[] = [];

    for (const attr of node.attributes) {
      parts.push(innerSpaces + printAttribute(attr, options, innerIndent, innerIndent));
    }

    // Join with conjunctions
    let inner = parts[0];
    for (let i = 1; i < parts.length; i++) {
      const conj = node.conjunctions[i - 1] || ",";
      inner += `${conj === "," ? "," : " " + conj}\n${parts[i]}`;
    }

    const spaces = " ".repeat(indent);
    return `${cardinalityStr}{\n${inner}\n${spaces}}`;
  } else {
    let currentColumn = column + cardinalityStr.length + 2; // "{ "
    const parts: string[] = [];

    for (let i = 0; i < node.attributes.length; i++) {
      const attrStr = printAttribute(node.attributes[i], options, indent, currentColumn);
      parts.push(attrStr);
      currentColumn += attrStr.length;

      if (i < node.attributes.length - 1) {
        const conj = node.conjunctions[i] || ",";
        const conjStr = conj === "," ? ", " : " " + conj + " ";
        currentColumn += conjStr.length;
      }
    }

    let inner = parts[0];
    for (let i = 1; i < parts.length; i++) {
      const conj = node.conjunctions[i - 1] || ",";
      inner += `${conj === "," ? ", " : " " + conj + " "}${parts[i]}`;
    }

    return `${cardinalityStr}{ ${inner} }`;
  }
}

function printAttribute(
  node: ast.Attribute,
  options: FormattingOptions,
  indent: number,
  column: number
): string {
  let result = "";
  let currentColumn = column;

  if (node.cardinality) {
    const card = printCardinality(node.cardinality);
    result += card + " ";
    currentColumn += card.length + 1;
  }

  if (node.reverseFlag) {
    result += "R ";
    currentColumn += 2;
  }

  const nameStr = print(node.name as ast.AstNode, options, indent, currentColumn);
  result += nameStr;
  currentColumn += nameStr.length;

  result += ` ${node.comparator} `;
  currentColumn += 1 + node.comparator.length + 1;

  const valueStr = print(node.value as ast.AstNode, options, indent, currentColumn);
  result += valueStr;

  return result;
}

/**
 * Prints a dotted attribute path.
 *
 * Dotted notation allows chained attribute navigation (e.g., x . a . b).
 * Each component is a sub-expression separated by dots with spaces.
 * Semantically equivalent to reverse syntax: x . a = * : R a = x
 *
 * @param node - DottedAttributePath AST node with base and chained attributes
 * @param options - Formatting options (for nested expressions)
 * @param indent - Current indentation level
 * @param column - Current column position for alignment
 * @returns Formatted dotted path string
 *
 * @example
 * Input: { base: SubExpr(< 125605004), attributes: [SubExpr(363698007)] }
 * Output: "< 125605004 . 363698007"
 *
 * @example
 * Input: { base: SubExpr(<< 19829001), attributes: [SubExpr(< 47429007), SubExpr(363698007)] }
 * Output: "<< 19829001 . < 47429007 . 363698007"
 */
function printDottedAttributePath(
  node: ast.DottedAttributePath,
  options: FormattingOptions,
  indent: number,
  column: number
): string {
  let result = print(node.base as ast.AstNode, options, indent, column);
  let currentColumn = column + result.length;

  for (const attr of node.attributes) {
    result += " . ";
    currentColumn += 3;
    const attrStr = print(attr as ast.AstNode, options, indent, currentColumn);
    result += attrStr;
    currentColumn += attrStr.length;
  }

  return result;
}

function printCardinality(node: ast.Cardinality): string {
  const min = node.min === "*" ? "*" : String(node.min);
  const max = node.max === "*" ? "*" : String(node.max);
  return `[${min}..${max}]`;
}

function printFilter(
  node: ast.Filter,
  options: FormattingOptions,
  indent: number,
  column: number
): string {
  const constraints = node.constraints.map((c) =>
    printFilterConstraint(c, options, indent, column)
  );

  let result = constraints[0];
  for (let i = 1; i < constraints.length; i++) {
    const conj = node.conjunctions[i - 1] || "AND";
    result += ` ${conj} ${constraints[i]}`;
  }

  return `{{ ${result} }}`;
}

function printFilterConstraint(
  node: ast.FilterConstraint,
  _options: FormattingOptions,
  _indent: number,
  _column: number
): string {
  switch (node.type) {
    case "TermFilter": {
      const termFilter = node as ast.TermFilter;
      const quotedValues = termFilter.values.map(v => `"${v}"`);
      const valueStr = termFilter.values.length > 1
        ? `(${quotedValues.join(" ")})`
        : quotedValues[0];
      if (termFilter.operator) {
        return `term = ${termFilter.operator}:${valueStr}`;
      }
      return `term = ${valueStr}`;
    }

    case "LanguageFilter":
      return `language = ${(node as ast.LanguageFilter).value}`;

    case "TypeFilter": {
      const typeFilter = node as ast.TypeFilter;
      if (typeof typeFilter.value === "string") {
        return `type = ${typeFilter.value}`;
      }
      return `type = ${printConceptReference(typeFilter.value)}`;
    }

    case "DialectFilter": {
      const dialectFilter = node as ast.DialectFilter;
      let result = "dialect = ";
      if (typeof dialectFilter.value === "string") {
        result += dialectFilter.value;
      } else {
        result += printConceptReference(dialectFilter.value);
      }
      if (dialectFilter.acceptability) {
        result += ` (${dialectFilter.acceptability})`;
      }
      return result;
    }

    case "ModuleFilter":
      return `moduleId = ${printConceptReference((node as ast.ModuleFilter).value)}`;

    case "EffectiveTimeFilter": {
      const etFilter = node as ast.EffectiveTimeFilter;
      return `effectiveTime ${etFilter.comparator} "${etFilter.value}"`;
    }

    case "ActiveFilter":
      return `active = ${(node as ast.ActiveFilter).value}`;

    case "DefinitionStatusFilter": {
      const dsFilter = node as ast.DefinitionStatusFilter;
      if (typeof dsFilter.value === "string") {
        return `definitionStatusId = ${dsFilter.value}`;
      }
      return `definitionStatusId = ${printConceptReference(dsFilter.value)}`;
    }

    default:
      throw new Error(`Unknown filter type: ${(node as any).type}`);
  }
}
