/**
 * Formatting rules for ECL expressions
 */

import * as ast from "../parser/ast";

/**
 * Configuration options for the formatter
 */
export interface FormattingOptions {
  /** Number of spaces per indentation level (default: 2) */
  indentSize: number;
}

/**
 * Default formatting options
 */
export const defaultOptions: FormattingOptions = {
  indentSize: 2,
};

/**
 * Determines if an AST node is "complex" enough to warrant line breaks.
 *
 * A node is considered complex if it:
 * - Is a compound expression (AND/OR/MINUS)
 * - Is a refined expression (has refinement)
 * - Contains nested expressions in parentheses
 * - Has filters
 *
 * This is used to decide when to break compound expressions onto multiple lines.
 */
/**
 * Counts the number of operands in a flat compound expression chain
 * (e.g., "A OR B OR C OR D" has 4 operands)
 */
function countCompoundChainLength(node: ast.CompoundExpression): number {
  let count = 1; // Count the right operand

  // Traverse left side to count all operands in the chain
  let current: ast.AstNode = node.left;
  while (current.type === "CompoundExpression") {
    count++;
    current = (current as ast.CompoundExpression).left;
  }
  count++; // Count the leftmost operand

  return count;
}

export function isComplex(node: ast.AstNode): boolean {
  switch (node.type) {
    case "CompoundExpression": {
      const compound = node as ast.CompoundExpression;

      // Compound expressions with many operands should break
      // (e.g., "A OR B OR C OR D OR E" is too long for one line)
      if (countCompoundChainLength(compound) > 2) {
        return true;
      }

      // Otherwise, only complex if operands are complex
      return (
        isComplex(compound.left as ast.AstNode) ||
        isComplex(compound.right as ast.AstNode)
      );
    }

    case "RefinedExpression":
      // Refined expressions (with :) are always complex
      return true;

    case "SubExpression": {
      const subExpr = node as ast.SubExpression;
      // Complex if it has filters
      if (subExpr.filters && subExpr.filters.length > 0) {
        return true;
      }
      // Complex if focus concept is a nested expression
      if (subExpr.focusConcept.type === "NestedExpression") {
        return true;
      }
      return false;
    }

    case "NestedExpression": {
      const nested = node as ast.NestedExpression;
      // Check if the inner expression is complex
      return isComplex(nested.expression as ast.AstNode);
    }

    case "AttributeGroup": {
      // Attribute groups with multiple items are complex
      const group = node as ast.AttributeGroup;
      return group.items.length > 1;
    }

    case "NestedAttributeSet": {
      // Nested attribute sets with multiple items are complex
      const nested = node as ast.NestedAttributeSet;
      return nested.items.length > 1;
    }

    case "Refinement": {
      const refinement = node as ast.Refinement;
      // Complex if has multiple items or any item is a group
      if (refinement.items.length > 1) return true;
      if (refinement.items.some((item) => item.type === "AttributeGroup")) {
        return true;
      }
      return false;
    }

    default:
      return false;
  }
}

/**
 * Determines if a refinement should be broken onto multiple lines
 */
export function shouldBreakRefinement(refinement: ast.Refinement): boolean {
  // Break if multiple items
  if (refinement.items.length > 1) return true;

  // Break if any item is an attribute group
  if (refinement.items.some((item) => item.type === "AttributeGroup")) {
    return true;
  }

  // Break if any attribute group has multiple items
  for (const item of refinement.items) {
    if (item.type === "AttributeGroup" && item.items.length > 1) {
      return true;
    }
  }

  return false;
}

/**
 * Determines if an attribute group should be broken onto multiple lines
 */
export function shouldBreakAttributeGroup(group: ast.AttributeGroup): boolean {
  return group.items.length > 1;
}

/**
 * Determines if a compound expression should be broken onto multiple lines
 */
export function shouldBreakCompound(compound: ast.CompoundExpression): boolean {
  // Always break if either operand is complex
  return (
    isComplex(compound.left as ast.AstNode) ||
    isComplex(compound.right as ast.AstNode)
  );
}
