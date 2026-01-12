import { CstParser, CstNode, IToken } from "chevrotain";
import {
  allTokens,
  // Constraint operators - brief
  DescendantOf,
  DescendantOrSelfOf,
  ChildOf,
  ChildOrSelfOf,
  AncestorOf,
  AncestorOrSelfOf,
  ParentOf,
  ParentOrSelfOf,
  MemberOf,
  Wildcard,
  // Constraint operators - long
  DescendantOfKeyword,
  DescendantOrSelfOfKeyword,
  ChildOfKeyword,
  ChildOrSelfOfKeyword,
  AncestorOfKeyword,
  AncestorOrSelfOfKeyword,
  ParentOfKeyword,
  ParentOrSelfOfKeyword,
  MemberOfKeyword,
  // Logical
  And,
  Or,
  Minus,
  // Comparison
  Equals,
  NotEquals,
  LessThanOrEquals,
  GreaterThanOrEquals,
  // Delimiters
  LParen,
  RParen,
  LBrace,
  RBrace,
  LBracket,
  RBracket,
  DoubleLBrace,
  DoubleRBrace,
  Colon,
  Comma,
  Hash,
  DotDot,
  Pipe,
  // Literals
  SctId,
  Integer,
  StringLiteral,
  TermString,
  DialectAlias,
  Identifier,
  // Filter keywords
  Term,
  Language,
  TypeKeyword,
  Dialect,
  ModuleId,
  EffectiveTime,
  Active,
  DefinitionStatusId,
  Preferred,
  Acceptable,
  Primitive,
  Defined,
  Match,
  Wild,
  True,
  False,
  // Comments
  BlockComment,
} from "./lexer";

export class EclParser extends CstParser {
  constructor() {
    super(allTokens, {
      recoveryEnabled: true,
    });
    this.performSelfAnalysis();
  }

  // Entry point
  public expressionConstraint = this.RULE("expressionConstraint", () => {
    this.SUBRULE(this.subExpressionConstraint);
    this.OPTION(() => {
      this.OR([
        // Compound: AND/OR/MINUS
        {
          ALT: () => {
            this.AT_LEAST_ONE(() => {
              this.SUBRULE(this.booleanOperator);
              this.SUBRULE2(this.subExpressionConstraint);
            });
          },
        },
        // Refined: colon + refinement
        {
          ALT: () => {
            this.CONSUME(Colon);
            this.SUBRULE(this.eclRefinement);
          },
        },
      ]);
    });
  });

  // Boolean/logical operator
  private booleanOperator = this.RULE("booleanOperator", () => {
    this.OR([
      { ALT: () => this.CONSUME(And) },
      { ALT: () => this.CONSUME(Or) },
      { ALT: () => this.CONSUME(Minus) },
    ]);
  });

  // Sub-expression: optional constraint + focus concept + optional filters
  private subExpressionConstraint = this.RULE("subExpressionConstraint", () => {
    this.OPTION(() => {
      this.SUBRULE(this.constraintOperator);
    });
    this.SUBRULE(this.eclFocusConcept);
    this.MANY(() => {
      this.SUBRULE(this.filterConstraint);
    });
  });

  // Constraint operator (brief or long form)
  private constraintOperator = this.RULE("constraintOperator", () => {
    this.OR([
      // Brief syntax
      { ALT: () => this.CONSUME(ChildOrSelfOf) },
      { ALT: () => this.CONSUME(DescendantOrSelfOf) },
      { ALT: () => this.CONSUME(ChildOf) },
      { ALT: () => this.CONSUME(DescendantOf) },
      { ALT: () => this.CONSUME(ParentOrSelfOf) },
      { ALT: () => this.CONSUME(AncestorOrSelfOf) },
      { ALT: () => this.CONSUME(ParentOf) },
      { ALT: () => this.CONSUME(AncestorOf) },
      { ALT: () => this.CONSUME(MemberOf) },
      // Long form keywords
      { ALT: () => this.CONSUME(DescendantOrSelfOfKeyword) },
      { ALT: () => this.CONSUME(DescendantOfKeyword) },
      { ALT: () => this.CONSUME(ChildOrSelfOfKeyword) },
      { ALT: () => this.CONSUME(ChildOfKeyword) },
      { ALT: () => this.CONSUME(AncestorOrSelfOfKeyword) },
      { ALT: () => this.CONSUME(AncestorOfKeyword) },
      { ALT: () => this.CONSUME(ParentOrSelfOfKeyword) },
      { ALT: () => this.CONSUME(ParentOfKeyword) },
      { ALT: () => this.CONSUME(MemberOfKeyword) },
    ]);
  });

  // Focus concept: concept reference, wildcard, nested expression, or alternate identifier
  private eclFocusConcept = this.RULE("eclFocusConcept", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.eclConceptReference) },
      { ALT: () => this.CONSUME(Wildcard) },
      {
        ALT: () => {
          this.CONSUME(LParen);
          this.SUBRULE(this.expressionConstraint);
          this.CONSUME(RParen);
        },
      },
      { ALT: () => this.SUBRULE(this.alternateIdentifier) },
    ]);
  });

  // Concept reference: SCTID with optional term
  private eclConceptReference = this.RULE("eclConceptReference", () => {
    this.CONSUME(SctId);
    this.OPTION(() => {
      this.CONSUME(TermString);
    });
  });

  // Alternate identifier: SCHEME#code
  private alternateIdentifier = this.RULE("alternateIdentifier", () => {
    this.CONSUME(Identifier);
    this.CONSUME(Hash);
    this.OR([
      { ALT: () => this.CONSUME(StringLiteral) },
      { ALT: () => this.CONSUME(SctId) },
      { ALT: () => this.CONSUME2(Identifier) },
    ]);
  });

  // Refinement: attribute or group with optional conjunctions
  private eclRefinement = this.RULE("eclRefinement", () => {
    this.SUBRULE(this.eclRefinementItem);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(And) },
        { ALT: () => this.CONSUME(Or) },
        { ALT: () => this.CONSUME(Comma) },
      ]);
      this.SUBRULE2(this.eclRefinementItem);
    });
  });

  // Refinement item: attribute group or single attribute
  private eclRefinementItem = this.RULE("eclRefinementItem", () => {
    this.OPTION(() => {
      this.SUBRULE(this.cardinality);
    });
    this.OR([
      { ALT: () => this.SUBRULE(this.eclAttributeGroup) },
      { ALT: () => this.SUBRULE(this.eclAttribute) },
    ]);
  });

  // Attribute group: { attributes }
  private eclAttributeGroup = this.RULE("eclAttributeGroup", () => {
    this.CONSUME(LBrace);
    this.SUBRULE(this.eclAttributeSet);
    this.CONSUME(RBrace);
  });

  // Attribute set: one or more attributes
  private eclAttributeSet = this.RULE("eclAttributeSet", () => {
    this.SUBRULE(this.eclAttribute);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(And) },
        { ALT: () => this.CONSUME(Or) },
        { ALT: () => this.CONSUME(Comma) },
      ]);
      this.SUBRULE2(this.eclAttribute);
    });
  });

  // Single attribute: name comparator value
  private eclAttribute = this.RULE("eclAttribute", () => {
    this.SUBRULE(this.eclAttributeName);
    this.SUBRULE(this.comparator);
    this.SUBRULE(this.eclAttributeValue);
  });

  // Attribute name: concept reference or wildcard
  private eclAttributeName = this.RULE("eclAttributeName", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.eclConceptReference) },
      { ALT: () => this.CONSUME(Wildcard) },
    ]);
  });

  // Comparator
  private comparator = this.RULE("comparator", () => {
    this.OR([
      { ALT: () => this.CONSUME(Equals) },
      { ALT: () => this.CONSUME(NotEquals) },
      { ALT: () => this.CONSUME(LessThanOrEquals) },
      { ALT: () => this.CONSUME(GreaterThanOrEquals) },
      { ALT: () => this.CONSUME(DescendantOf) }, // < used as comparator
      { ALT: () => this.CONSUME(AncestorOf) }, // > used as comparator
    ]);
  });

  // Attribute value: expression or concrete value
  private eclAttributeValue = this.RULE("eclAttributeValue", () => {
    this.OR([
      // Concrete values first (unambiguous)
      { ALT: () => this.CONSUME(StringLiteral) },
      { ALT: () => this.CONSUME(True) },
      { ALT: () => this.CONSUME(False) },
      // Sub-expression handles nested expressions via eclFocusConcept
      { ALT: () => this.SUBRULE(this.subExpressionConstraint) },
    ]);
  });

  // Cardinality: [min..max]
  private cardinality = this.RULE("cardinality", () => {
    this.CONSUME(LBracket);
    this.OR([
      { ALT: () => this.CONSUME(Integer) },
      { ALT: () => this.CONSUME(Wildcard) },
    ]);
    this.CONSUME(DotDot);
    this.OR2([
      { ALT: () => this.CONSUME2(Integer) },
      { ALT: () => this.CONSUME2(Wildcard) },
    ]);
    this.CONSUME(RBracket);
  });

  // Filter constraint: {{ ... }}
  private filterConstraint = this.RULE("filterConstraint", () => {
    this.CONSUME(DoubleLBrace);
    this.SUBRULE(this.filterExpressionConstraint);
    this.CONSUME(DoubleRBrace);
  });

  // Filter expression: one or more filters
  private filterExpressionConstraint = this.RULE(
    "filterExpressionConstraint",
    () => {
      this.SUBRULE(this.filter);
      this.MANY(() => {
        this.OR([
          { ALT: () => this.CONSUME(And) },
          { ALT: () => this.CONSUME(Or) },
          { ALT: () => this.CONSUME(Comma) },
        ]);
        this.SUBRULE2(this.filter);
      });
    }
  );

  // Individual filter
  private filter = this.RULE("filter", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.termFilter) },
      { ALT: () => this.SUBRULE(this.languageFilter) },
      { ALT: () => this.SUBRULE(this.typeFilter) },
      { ALT: () => this.SUBRULE(this.dialectFilter) },
      { ALT: () => this.SUBRULE(this.moduleFilter) },
      { ALT: () => this.SUBRULE(this.activeFilter) },
      { ALT: () => this.SUBRULE(this.definitionStatusFilter) },
    ]);
  });

  // Term filter: term = "value" or term = match:"value"
  private termFilter = this.RULE("termFilter", () => {
    this.CONSUME(Term);
    this.CONSUME(Equals);
    this.OPTION(() => {
      this.OR([
        { ALT: () => this.CONSUME(Match) },
        { ALT: () => this.CONSUME(Wild) },
      ]);
      this.CONSUME(Colon);
    });
    this.CONSUME(StringLiteral);
  });

  // Language filter
  private languageFilter = this.RULE("languageFilter", () => {
    this.CONSUME(Language);
    this.CONSUME(Equals);
    this.CONSUME(DialectAlias);
  });

  // Type filter
  private typeFilter = this.RULE("typeFilter", () => {
    this.CONSUME(TypeKeyword);
    this.CONSUME(Equals);
    this.OR([
      { ALT: () => this.CONSUME(Preferred) },
      { ALT: () => this.CONSUME(Acceptable) },
      { ALT: () => this.SUBRULE(this.eclConceptReference) },
    ]);
  });

  // Dialect filter
  private dialectFilter = this.RULE("dialectFilter", () => {
    this.CONSUME(Dialect);
    this.CONSUME(Equals);
    this.OR([
      { ALT: () => this.CONSUME(DialectAlias) },
      { ALT: () => this.SUBRULE(this.eclConceptReference) },
    ]);
    this.OPTION(() => {
      this.CONSUME(LParen);
      this.OR2([
        { ALT: () => this.CONSUME(Preferred) },
        { ALT: () => this.CONSUME(Acceptable) },
      ]);
      this.CONSUME(RParen);
    });
  });

  // Module filter
  private moduleFilter = this.RULE("moduleFilter", () => {
    this.CONSUME(ModuleId);
    this.CONSUME(Equals);
    this.SUBRULE(this.eclConceptReference);
  });

  // Active filter
  private activeFilter = this.RULE("activeFilter", () => {
    this.CONSUME(Active);
    this.CONSUME(Equals);
    this.OR([
      { ALT: () => this.CONSUME(True) },
      { ALT: () => this.CONSUME(False) },
    ]);
  });

  // Definition status filter
  private definitionStatusFilter = this.RULE("definitionStatusFilter", () => {
    this.CONSUME(DefinitionStatusId);
    this.CONSUME(Equals);
    this.OR([
      { ALT: () => this.CONSUME(Primitive) },
      { ALT: () => this.CONSUME(Defined) },
      { ALT: () => this.SUBRULE(this.eclConceptReference) },
    ]);
  });
}

// Create singleton parser instance
export const parser = new EclParser();

// Helper function to parse ECL
export function parse(tokens: IToken[]) {
  parser.input = tokens;
  const cst = parser.expressionConstraint();
  return {
    cst,
    errors: parser.errors,
  };
}
