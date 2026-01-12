import { CstNode, IToken } from "chevrotain";
import { parser } from "./parser";
import * as ast from "./ast";

// Get the base visitor class from the parser
const BaseEclVisitor = parser.getBaseCstVisitorConstructor();

export class EclAstVisitor extends BaseEclVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  expressionConstraint(ctx: any): ast.ExpressionConstraint["expression"] {
    const first = this.visit(ctx.simpleOrRefinedExpression[0]);

    // Check if this is a compound expression (has boolean operators)
    if (ctx.booleanOperator && ctx.booleanOperator.length > 0) {
      // Build compound expression chain
      let result = first;
      for (let i = 0; i < ctx.booleanOperator.length; i++) {
        const operator = this.visit(ctx.booleanOperator[i]);
        const right = this.visit(ctx.simpleOrRefinedExpression[i + 1]);
        result = {
          type: "CompoundExpression",
          operator,
          left: result,
          right,
        } as ast.CompoundExpression;
      }
      return result;
    }

    // Single expression (simple or refined)
    return first;
  }

  simpleOrRefinedExpression(ctx: any): ast.SubExpression | ast.RefinedExpression {
    const subExpr = this.visit(ctx.subExpressionConstraint[0]) as ast.SubExpression;

    // Check if this has a refinement
    if (ctx.Colon && ctx.eclRefinement) {
      return {
        type: "RefinedExpression",
        expression: subExpr,
        refinement: this.visit(ctx.eclRefinement[0]),
      } as ast.RefinedExpression;
    }

    return subExpr;
  }

  booleanOperator(ctx: any): "AND" | "OR" | "MINUS" {
    if (ctx.And) return "AND";
    if (ctx.Or) return "OR";
    if (ctx.Minus) return "MINUS";
    throw new Error("Unknown boolean operator");
  }

  subExpressionConstraint(ctx: any): ast.SubExpression {
    const result: ast.SubExpression = {
      type: "SubExpression",
      focusConcept: this.visit(ctx.eclFocusConcept[0]),
    };

    if (ctx.constraintOperator) {
      result.constraintOperator = this.visit(ctx.constraintOperator[0]);
    }

    if (ctx.filterConstraint && ctx.filterConstraint.length > 0) {
      result.filters = ctx.filterConstraint.map((fc: any) => this.visit(fc));
    }

    return result;
  }

  constraintOperator(ctx: any): ast.ConstraintOperator {
    let operator: ast.ConstraintOperator["operator"];

    // Brief syntax
    if (ctx.ChildOrSelfOf) operator = "<<!";
    else if (ctx.DescendantOrSelfOf) operator = "<<";
    else if (ctx.ChildOf) operator = "<!";
    else if (ctx.DescendantOf) operator = "<";
    else if (ctx.ParentOrSelfOf) operator = ">>!";
    else if (ctx.AncestorOrSelfOf) operator = ">>";
    else if (ctx.ParentOf) operator = ">!";
    else if (ctx.AncestorOf) operator = ">";
    else if (ctx.MemberOf) operator = "^";
    // Long form
    else if (ctx.DescendantOrSelfOfKeyword) operator = "descendantOrSelfOf";
    else if (ctx.DescendantOfKeyword) operator = "descendantOf";
    else if (ctx.ChildOrSelfOfKeyword) operator = "childOrSelfOf";
    else if (ctx.ChildOfKeyword) operator = "childOf";
    else if (ctx.AncestorOrSelfOfKeyword) operator = "ancestorOrSelfOf";
    else if (ctx.AncestorOfKeyword) operator = "ancestorOf";
    else if (ctx.ParentOrSelfOfKeyword) operator = "parentOrSelfOf";
    else if (ctx.ParentOfKeyword) operator = "parentOf";
    else if (ctx.MemberOfKeyword) operator = "memberOf";
    else throw new Error("Unknown constraint operator");

    return { type: "ConstraintOperator", operator };
  }

  eclFocusConcept(ctx: any): ast.FocusConcept {
    if (ctx.eclConceptReference) {
      return this.visit(ctx.eclConceptReference[0]);
    }
    if (ctx.Wildcard) {
      return { type: "WildcardConcept" } as ast.WildcardConcept;
    }
    if (ctx.expressionConstraint) {
      return {
        type: "NestedExpression",
        expression: this.visit(ctx.expressionConstraint[0]),
      } as ast.NestedExpression;
    }
    if (ctx.alternateIdentifier) {
      return this.visit(ctx.alternateIdentifier[0]);
    }
    throw new Error("Unknown focus concept type");
  }

  eclConceptReference(ctx: any): ast.ConceptReference {
    const sctId = ctx.SctId[0].image;
    let term: string | undefined;

    if (ctx.TermString) {
      // Remove the pipe delimiters
      const termWithPipes = ctx.TermString[0].image;
      term = termWithPipes.slice(1, -1).trim();
    }

    return { type: "ConceptReference", sctId, term };
  }

  alternateIdentifier(ctx: any): ast.AlternateIdentifier {
    const scheme = ctx.Identifier[0].image;
    let code: string;

    if (ctx.StringLiteral) {
      // Remove quotes
      code = ctx.StringLiteral[0].image.slice(1, -1);
    } else if (ctx.SctId) {
      code = ctx.SctId[0].image;
    } else if (ctx.Identifier && ctx.Identifier.length > 1) {
      code = ctx.Identifier[1].image;
    } else {
      throw new Error("Unknown alternate identifier code type");
    }

    return { type: "AlternateIdentifier", scheme, code };
  }

  eclRefinement(ctx: any): ast.Refinement {
    const items: ast.RefinementItem[] = [];
    const conjunctions: ("AND" | "OR" | ",")[] = [];

    // First item
    items.push(this.visit(ctx.eclRefinementItem[0]));

    // Additional items with conjunctions
    if (ctx.eclRefinementItem.length > 1) {
      for (let i = 1; i < ctx.eclRefinementItem.length; i++) {
        // Determine conjunction
        if (ctx.And && ctx.And[i - 1]) conjunctions.push("AND");
        else if (ctx.Or && ctx.Or[i - 1]) conjunctions.push("OR");
        else if (ctx.Comma && ctx.Comma[i - 1]) conjunctions.push(",");

        items.push(this.visit(ctx.eclRefinementItem[i]));
      }
    }

    return { type: "Refinement", items, conjunctions };
  }

  eclRefinementItem(ctx: any): ast.RefinementItem {
    let cardinality: ast.Cardinality | undefined;
    if (ctx.cardinality) {
      cardinality = this.visit(ctx.cardinality[0]);
    }

    if (ctx.eclAttributeGroup) {
      const group = this.visit(ctx.eclAttributeGroup[0]) as ast.AttributeGroup;
      if (cardinality) {
        group.cardinality = cardinality;
      }
      return group;
    }

    if (ctx.eclAttribute) {
      const attr = this.visit(ctx.eclAttribute[0]) as ast.Attribute;
      if (cardinality) {
        attr.cardinality = cardinality;
      }
      return attr;
    }

    throw new Error("Unknown refinement item type");
  }

  eclAttributeGroup(ctx: any): ast.AttributeGroup {
    const attrSet = this.visit(ctx.eclAttributeSet[0]);
    return {
      type: "AttributeGroup",
      attributes: attrSet.attributes,
      conjunctions: attrSet.conjunctions,
    };
  }

  eclAttributeSet(ctx: any): { attributes: ast.Attribute[]; conjunctions: ("AND" | "OR" | ",")[] } {
    const attributes: ast.Attribute[] = [];
    const conjunctions: ("AND" | "OR" | ",")[] = [];

    // First attribute
    attributes.push(this.visit(ctx.eclAttribute[0]));

    // Additional attributes with conjunctions
    if (ctx.eclAttribute.length > 1) {
      for (let i = 1; i < ctx.eclAttribute.length; i++) {
        if (ctx.And && ctx.And[i - 1]) conjunctions.push("AND");
        else if (ctx.Or && ctx.Or[i - 1]) conjunctions.push("OR");
        else if (ctx.Comma && ctx.Comma[i - 1]) conjunctions.push(",");

        attributes.push(this.visit(ctx.eclAttribute[i]));
      }
    }

    return { attributes, conjunctions };
  }

  eclAttribute(ctx: any): ast.Attribute {
    return {
      type: "Attribute",
      name: this.visit(ctx.eclAttributeName[0]),
      comparator: this.visit(ctx.comparator[0]),
      value: this.visit(ctx.eclAttributeValue[0]),
    };
  }

  eclAttributeName(ctx: any): ast.AttributeName {
    return this.visit(ctx.subExpressionConstraint[0]) as ast.SubExpression;
  }

  comparator(ctx: any): ast.Attribute["comparator"] {
    if (ctx.Equals) return "=";
    if (ctx.NotEquals) return "!=";
    if (ctx.LessThanOrEquals) return "<=";
    if (ctx.GreaterThanOrEquals) return ">=";
    if (ctx.DescendantOf) return "<";
    if (ctx.AncestorOf) return ">";
    throw new Error("Unknown comparator");
  }

  eclAttributeValue(ctx: any): ast.AttributeValue {
    if (ctx.expressionConstraint) {
      return {
        type: "NestedExpression",
        expression: this.visit(ctx.expressionConstraint[0]),
      } as ast.NestedExpression;
    }
    if (ctx.subExpressionConstraint) {
      return this.visit(ctx.subExpressionConstraint[0]);
    }
    if (ctx.StringLiteral) {
      return {
        type: "StringValue",
        value: ctx.StringLiteral[0].image.slice(1, -1),
      } as ast.StringValue;
    }
    if (ctx.Integer) {
      return {
        type: "NumberValue",
        value: parseInt(ctx.Integer[0].image, 10),
      } as ast.NumberValue;
    }
    if (ctx.True) {
      return { type: "BooleanValue", value: true } as ast.BooleanValue;
    }
    if (ctx.False) {
      return { type: "BooleanValue", value: false } as ast.BooleanValue;
    }
    throw new Error("Unknown attribute value type");
  }

  cardinality(ctx: any): ast.Cardinality {
    // Collect all min/max tokens and sort by position
    const allTokens: Array<{ token: any; isWildcard: boolean }> = [];

    if (ctx.Integer) {
      for (const token of ctx.Integer) {
        allTokens.push({ token, isWildcard: false });
      }
    }
    if (ctx.Wildcard) {
      for (const token of ctx.Wildcard) {
        allTokens.push({ token, isWildcard: true });
      }
    }

    // Sort by start offset to get [min, max] order
    allTokens.sort((a, b) => a.token.startOffset - b.token.startOffset);

    const minEntry = allTokens[0];
    const maxEntry = allTokens[1];

    const min = minEntry.isWildcard ? "*" : parseInt(minEntry.token.image, 10);
    const max = maxEntry.isWildcard ? "*" : parseInt(maxEntry.token.image, 10);

    return { type: "Cardinality", min, max };
  }

  filterConstraint(ctx: any): ast.Filter {
    return this.visit(ctx.filterExpressionConstraint[0]);
  }

  filterExpressionConstraint(ctx: any): ast.Filter {
    const constraints: ast.FilterConstraint[] = [];
    const conjunctions: ("AND" | "OR")[] = [];

    constraints.push(this.visit(ctx.filter[0]));

    if (ctx.filter.length > 1) {
      for (let i = 1; i < ctx.filter.length; i++) {
        if (ctx.And && ctx.And[i - 1]) conjunctions.push("AND");
        else if (ctx.Or && ctx.Or[i - 1]) conjunctions.push("OR");

        constraints.push(this.visit(ctx.filter[i]));
      }
    }

    return { type: "Filter", constraints, conjunctions };
  }

  filter(ctx: any): ast.FilterConstraint {
    if (ctx.termFilter) return this.visit(ctx.termFilter[0]);
    if (ctx.languageFilter) return this.visit(ctx.languageFilter[0]);
    if (ctx.typeFilter) return this.visit(ctx.typeFilter[0]);
    if (ctx.dialectFilter) return this.visit(ctx.dialectFilter[0]);
    if (ctx.moduleFilter) return this.visit(ctx.moduleFilter[0]);
    if (ctx.activeFilter) return this.visit(ctx.activeFilter[0]);
    if (ctx.definitionStatusFilter) return this.visit(ctx.definitionStatusFilter[0]);
    throw new Error("Unknown filter type");
  }

  termFilter(ctx: any): ast.TermFilter {
    let operator: "match" | "wild" | undefined;
    if (ctx.Match) operator = "match";
    if (ctx.Wild) operator = "wild";

    return {
      type: "TermFilter",
      operator,
      value: ctx.StringLiteral[0].image.slice(1, -1),
    };
  }

  languageFilter(ctx: any): ast.LanguageFilter {
    return {
      type: "LanguageFilter",
      value: ctx.DialectAlias[0].image,
    };
  }

  typeFilter(ctx: any): ast.TypeFilter {
    let value: ast.TypeFilter["value"];
    if (ctx.Preferred) value = "PREFERRED";
    else if (ctx.Acceptable) value = "ACCEPTABLE";
    else if (ctx.eclConceptReference) value = this.visit(ctx.eclConceptReference[0]);
    else throw new Error("Unknown type filter value");

    return { type: "TypeFilter", value };
  }

  dialectFilter(ctx: any): ast.DialectFilter {
    let value: ast.DialectFilter["value"];
    if (ctx.DialectAlias) value = ctx.DialectAlias[0].image;
    else if (ctx.eclConceptReference) value = this.visit(ctx.eclConceptReference[0]);
    else throw new Error("Unknown dialect filter value");

    let acceptability: ast.DialectFilter["acceptability"];
    if (ctx.Preferred) acceptability = "PREFERRED";
    else if (ctx.Acceptable) acceptability = "ACCEPTABLE";

    return { type: "DialectFilter", value, acceptability };
  }

  moduleFilter(ctx: any): ast.ModuleFilter {
    return {
      type: "ModuleFilter",
      value: this.visit(ctx.eclConceptReference[0]),
    };
  }

  activeFilter(ctx: any): ast.ActiveFilter {
    return {
      type: "ActiveFilter",
      value: !!ctx.True,
    };
  }

  definitionStatusFilter(ctx: any): ast.DefinitionStatusFilter {
    let value: ast.DefinitionStatusFilter["value"];
    if (ctx.Primitive) value = "PRIMITIVE";
    else if (ctx.Defined) value = "DEFINED";
    else if (ctx.eclConceptReference) value = this.visit(ctx.eclConceptReference[0]);
    else throw new Error("Unknown definition status filter value");

    return { type: "DefinitionStatusFilter", value };
  }
}

// Create singleton visitor instance
export const astVisitor = new EclAstVisitor();

// Helper function to build AST from CST
export function buildAst(cst: CstNode): ast.ExpressionConstraint["expression"] {
  return astVisitor.visit(cst);
}
