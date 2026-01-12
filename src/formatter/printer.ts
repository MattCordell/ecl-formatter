/**
 * AST Pretty Printer for ECL expressions
 */

import * as ast from "../parser/ast";
import {
  FormattingOptions,
  defaultOptions,
  shouldBreakCompound,
  shouldBreakRefinement,
  shouldBreakAttributeGroup,
} from "./rules";

/**
 * Print an AST node as a formatted ECL string
 */
export function print(
  node: ast.AstNode,
  options: FormattingOptions = defaultOptions,
  indent: number = 0
): string {
  const spaces = " ".repeat(indent);

  switch (node.type) {
    case "CompoundExpression":
      return printCompound(node as ast.CompoundExpression, options, indent);

    case "RefinedExpression":
      return printRefined(node as ast.RefinedExpression, options, indent);

    case "SubExpression":
      return printSubExpression(node as ast.SubExpression, options, indent);

    case "ConceptReference":
      return printConceptReference(node as ast.ConceptReference);

    case "WildcardConcept":
      return "*";

    case "AlternateIdentifier":
      return printAlternateIdentifier(node as ast.AlternateIdentifier);

    case "NestedExpression":
      return printNestedExpression(node as ast.NestedExpression, options, indent);

    case "ConstraintOperator":
      return printConstraintOperator(node as ast.ConstraintOperator);

    case "Refinement":
      return printRefinement(node as ast.Refinement, options, indent);

    case "AttributeGroup":
      return printAttributeGroup(node as ast.AttributeGroup, options, indent);

    case "Attribute":
      return printAttribute(node as ast.Attribute, options, indent);

    case "Cardinality":
      return printCardinality(node as ast.Cardinality);

    case "Filter":
      return printFilter(node as ast.Filter, options, indent);

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
  indent: number
): string {
  const shouldBreak = shouldBreakCompound(node);
  const leftStr = print(node.left as ast.AstNode, options, indent);
  const nextIndent = indent + options.indentSize;

  if (shouldBreak) {
    const rightStr = print(node.right as ast.AstNode, options, nextIndent);
    const spaces = " ".repeat(indent);
    return `${leftStr}\n${spaces}${node.operator}\n${" ".repeat(nextIndent)}${rightStr}`;
  } else {
    const rightStr = print(node.right as ast.AstNode, options, indent);
    return `${leftStr} ${node.operator} ${rightStr}`;
  }
}

function printRefined(
  node: ast.RefinedExpression,
  options: FormattingOptions,
  indent: number
): string {
  const exprStr = print(node.expression, options, indent);
  const shouldBreak = shouldBreakRefinement(node.refinement);

  if (shouldBreak) {
    const nextIndent = indent + options.indentSize;
    const refinementStr = printRefinement(node.refinement, options, nextIndent);
    return `${exprStr}:\n${refinementStr}`;
  } else {
    const refinementStr = printRefinement(node.refinement, options, indent);
    return `${exprStr}: ${refinementStr}`;
  }
}

function printSubExpression(
  node: ast.SubExpression,
  options: FormattingOptions,
  indent: number
): string {
  let result = "";

  if (node.constraintOperator) {
    result += printConstraintOperator(node.constraintOperator) + " ";
  }

  result += print(node.focusConcept as ast.AstNode, options, indent);

  if (node.filters && node.filters.length > 0) {
    for (const filter of node.filters) {
      result += " " + printFilter(filter, options, indent);
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
  indent: number
): string {
  const innerStr = print(node.expression as ast.AstNode, options, indent);
  return `(${innerStr})`;
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
  indent: number
): string {
  const spaces = " ".repeat(indent);
  const shouldBreak = shouldBreakRefinement(node);

  if (shouldBreak) {
    const parts: string[] = [];
    for (let i = 0; i < node.items.length; i++) {
      const itemStr = print(node.items[i] as ast.AstNode, options, indent);
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
    const parts = node.items.map((item) =>
      print(item as ast.AstNode, options, indent)
    );

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
  indent: number
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
      parts.push(innerSpaces + printAttribute(attr, options, innerIndent));
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
    const parts = node.attributes.map((attr) =>
      printAttribute(attr, options, indent)
    );

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
  indent: number
): string {
  let result = "";

  if (node.cardinality) {
    result += printCardinality(node.cardinality) + " ";
  }

  if (node.reverseFlag) {
    result += "R ";
  }

  result += print(node.name as ast.AstNode, options, indent);
  result += ` ${node.comparator} `;
  result += print(node.value as ast.AstNode, options, indent);

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
  indent: number
): string {
  const constraints = node.constraints.map((c) =>
    printFilterConstraint(c, options, indent)
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
  options: FormattingOptions,
  indent: number
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
