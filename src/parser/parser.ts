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
  ReverseOf,
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
  Dot,
  DotDot,
  Pipe,
  // Literals
  SctId,
  Integer,
  DecimalValue,
  SignedInteger,
  StringLiteral,
  TermString,
  DialectAlias,
  AlternateIdCode,
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

/**
 * Chevrotain-based CST parser for SNOMED CT Expression Constraint Language (ECL).
 *
 * This parser uses Chevrotain's rule DSL to define the ECL grammar and produces a Concrete Syntax Tree (CST).
 * The CST preserves all syntactic information including whitespace and can be transformed into an AST
 * using the visitor pattern. Recovery mode is enabled to support error-tolerant parsing.
 *
 * @see https://docs.snomed.org/snomed-ct-specifications/snomed-ct-expression-constraint-language
 */
export class EclParser extends CstParser {
  constructor() {
    super(allTokens, {
      recoveryEnabled: true,
    });
    this.performSelfAnalysis();
  }

  /**
   * Parses an ECL expression constraint.
   *
   * This is the entry point for the ECL grammar. It handles compound expressions
   * formed by combining simple or refined expressions with boolean operators (AND, OR, MINUS).
   * Each expression can be a concept constraint with optional refinements and filters.
   *
   * @grammar expressionConstraint ::= simpleOrRefinedExpression (booleanOperator simpleOrRefinedExpression)*
   *
   * @example
   * - `<< 73211009 |Diabetes mellitus|`
   * - `<< 19829001 |Disorder of lung| AND << 301867009 |Edema of trunk|`
   * - `<< 404684003 |Clinical finding| : 363698007 |Finding site| = << 39057004 |Pulmonary valve structure|`
   */
  public expressionConstraint = this.RULE("expressionConstraint", () => {
    this.SUBRULE(this.simpleOrRefinedExpression);
    this.MANY(() => {
      this.SUBRULE(this.booleanOperator);
      this.SUBRULE2(this.simpleOrRefinedExpression);
    });
  });

  /**
   * Parses a simple expression with optional refinement.
   *
   * Represents a sub-expression constraint that can be refined with attribute constraints.
   * The refinement, if present, is introduced by a colon and specifies attribute-value pairs
   * that further constrain the concept set.
   *
   * @grammar simpleOrRefinedExpression ::= subExpressionConstraint (':' eclRefinement)?
   *
   * @example
   * - `<< 73211009 |Diabetes mellitus|` (no refinement)
   * - `<< 404684003 |Clinical finding| : 363698007 |Finding site| = << 39057004 |Pulmonary valve|` (with refinement)
   * - `* : 246075003 |Causative agent| = 387517004 |Paracetamol|` (wildcard with refinement)
   */
  private simpleOrRefinedExpression = this.RULE("simpleOrRefinedExpression", () => {
    this.SUBRULE(this.subExpressionConstraint);
    this.OPTION(() => {
      this.CONSUME(Colon);
      this.SUBRULE(this.eclRefinement);
    });
  });

  /**
   * Parses a boolean operator.
   *
   * Boolean operators combine multiple expression constraints to form compound expressions.
   * AND produces the intersection, OR produces the union, and MINUS produces the set difference.
   *
   * @grammar booleanOperator ::= 'AND' | 'OR' | 'MINUS'
   *
   * @example
   * - `AND` - Intersection of two concept sets
   * - `OR` - Union of two concept sets
   * - `MINUS` - Exclusion/difference of concept sets
   */
  private booleanOperator = this.RULE("booleanOperator", () => {
    this.OR([
      { ALT: () => this.CONSUME(And) },
      { ALT: () => this.CONSUME(Or) },
      { ALT: () => this.CONSUME(Minus) },
    ]);
  });

  /**
   * Parses a sub-expression constraint, optionally with dotted attribute path.
   *
   * This is a core building block consisting of an optional constraint operator (e.g., <<, <),
   * a focus concept (SCTID, wildcard, nested expression, or alternate ID), and optional filter
   * constraints. The constraint operator defines the relationship (descendant, ancestor, etc.)
   * to the focus concept.
   *
   * Dotted expressions allow chained attribute navigation (e.g., x . a . b), which is semantically
   * equivalent to reverse attribute syntax: x . a = * : R a = x
   *
   * @grammar subExpressionConstraint ::= constraintOperator? eclFocusConcept filterConstraint* (dot eclAttributeName)*
   *
   * @example
   * - `<< 73211009 |Diabetes mellitus|` (descendant-or-self constraint)
   * - `* {{ term = "disorder" }}` (wildcard with term filter)
   * - `descendantOf 404684003 |Clinical finding|` (long-form constraint operator)
   * - `< 125605004 . 363698007` (dotted notation - single dot)
   * - `<< 19829001 . < 47429007 . 363698007` (dotted notation - chained)
   */
  private subExpressionConstraint = this.RULE("subExpressionConstraint", () => {
    this.OPTION(() => {
      this.SUBRULE(this.constraintOperator);
    });
    this.SUBRULE(this.eclFocusConcept);
    this.MANY(() => {
      this.SUBRULE(this.filterConstraint);
    });
    this.MANY2(() => {
      this.CONSUME(Dot);
      this.SUBRULE(this.eclAttributeName);
    });
  });

  /**
   * Parses a constraint operator.
   *
   * Constraint operators define hierarchical or set membership relationships. They are available
   * in both brief symbolic form (<<, <, >>, >, ^) and long keyword form (descendantOf, childOf, etc.).
   * These operators determine which concepts are included based on their relationship to the focus concept.
   *
   * @grammar constraintOperator ::= '<<' | '<' | '>>' | '>' | '^' | '<<!' | '>>!' | '<!' | '>!'
   *                               | 'descendantOf' | 'descendantOrSelfOf' | 'childOf' | 'childOrSelfOf'
   *                               | 'ancestorOf' | 'ancestorOrSelfOf' | 'parentOf' | 'parentOrSelfOf' | 'memberOf'
   *
   * @example
   * - `<<` - Descendant or self of (includes the concept and all its descendants)
   * - `<` - Descendant of (excludes the concept itself)
   * - `descendantOf` - Long-form equivalent of `<`
   */
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

  /**
   * Parses an ECL focus concept.
   *
   * The focus concept is the central element of a constraint and can take four forms: a concept
   * reference (SCTID with optional term), a wildcard (*) matching any concept, a nested expression
   * in parentheses, or an alternate identifier referencing external coding systems. This flexibility
   * allows complex queries to be composed recursively.
   *
   * @grammar eclFocusConcept ::= eclConceptReference | '*' | '(' expressionConstraint ')' | alternateIdentifier
   *
   * @example
   * - `73211009 |Diabetes mellitus|` (concept reference)
   * - `*` (wildcard matching any concept)
   * - `(<< 404684003 |Clinical finding| OR << 272379006 |Event|)` (nested expression)
   * - `ICD-10#E11` (alternate identifier)
   */
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

  /**
   * Parses an ECL concept reference.
   *
   * A concept reference consists of a SNOMED CT Identifier (SCTID) optionally followed by a
   * human-readable term enclosed in pipe delimiters. The term is for readability only and does
   * not affect the semantic meaning of the constraint.
   *
   * @grammar eclConceptReference ::= SctId TermString?
   *
   * @example
   * - `73211009` (SCTID only)
   * - `73211009 |Diabetes mellitus|` (SCTID with term)
   * - `404684003 |Clinical finding|` (SCTID with descriptive term)
   */
  private eclConceptReference = this.RULE("eclConceptReference", () => {
    this.CONSUME(SctId);
    this.OPTION(() => {
      this.CONSUME(TermString);
    });
  });

  /**
   * Parses an alternate identifier.
   *
   * Alternate identifiers allow referencing concepts from external coding systems (e.g., ICD-10, LOINC).
   * The syntax is SCHEME#CODE where SCHEME is the coding system identifier and CODE is the code
   * within that system. The code can be a string literal, identifier, SCTID, or alternate ID code.
   *
   * @grammar alternateIdentifier ::= Identifier '#' (StringLiteral | AlternateIdCode | SctId | Identifier)
   *
   * @example
   * - `ICD-10#E11` (ICD-10 code for Type 2 diabetes)
   * - `LOINC#"2339-0"` (LOINC code with string literal)
   * - `SNOMEDCT#73211009` (alternate reference to SNOMED CT concept)
   */
  private alternateIdentifier = this.RULE("alternateIdentifier", () => {
    this.CONSUME(Identifier);
    this.CONSUME(Hash);
    this.OR([
      { ALT: () => this.CONSUME(StringLiteral) },
      { ALT: () => this.CONSUME(AlternateIdCode) },
      { ALT: () => this.CONSUME(SctId) },
      { ALT: () => this.CONSUME2(Identifier) },
    ]);
  });

  /**
   * Parses an ECL refinement.
   *
   * Refinements constrain concepts by specifying required attribute-value pairs. Multiple refinement
   * items can be combined using AND (conjunction), OR (disjunction), or comma (treated as AND).
   * Each item can be a single attribute or an attribute group enclosed in braces.
   *
   * @grammar eclRefinement ::= eclRefinementItem (('AND' | 'OR' | ',') eclRefinementItem)*
   *
   * @example
   * - `363698007 |Finding site| = << 39057004 |Pulmonary valve|` (single attribute)
   * - `116676008 |Associated morphology| = << 55641003 |Infarct| AND 363698007 |Finding site| = << 40207001 |Myocardium|` (multiple attributes with AND)
   * - `{ 363698007 |Finding site| = << 39057004 |Pulmonary valve| }` (attribute group)
   */
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

  /**
   * Parses a refinement item.
   *
   * A refinement item represents an attribute constraint, attribute group, or parenthesized attribute set.
   * It can be optionally prefixed with a cardinality constraint [min..max] to specify how many
   * times the attribute or group must appear. Cardinality is particularly important for modeling
   * clinical scenarios with multiple occurrences.
   *
   * @grammar eclRefinementItem ::= cardinality? (eclAttributeGroup | subAttributeSet)
   *
   * @example
   * - `363698007 |Finding site| = << 39057004 |Pulmonary valve|` (single attribute)
   * - `[1..3] { 363698007 |Finding site| = * }` (attribute group with cardinality)
   * - `[0..*] 246075003 |Causative agent| = << 105590001 |Substance|` (attribute with unbounded cardinality)
   * - `(363698007 = << 39057004 OR 116676008 = << 55641003)` (parenthesized attribute set)
   */
  private eclRefinementItem = this.RULE("eclRefinementItem", () => {
    this.OPTION(() => {
      this.SUBRULE(this.cardinality);
    });
    this.OR([
      { ALT: () => this.SUBRULE(this.eclAttributeGroup) },
      { ALT: () => this.SUBRULE(this.subAttributeSet) },
    ]);
  });

  /**
   * Parses an attribute group.
   *
   * Attribute groups organize related attributes together within braces, allowing precise modeling
   * of SNOMED CT's post-coordinated expressions. Grouping ensures that attributes apply collectively
   * to the same aspect of a concept, crucial for correctly representing complex clinical scenarios.
   *
   * @grammar eclAttributeGroup ::= '{' eclAttributeSet '}'
   *
   * @example
   * - `{ 363698007 |Finding site| = << 39057004 |Pulmonary valve| }` (single grouped attribute)
   * - `{ 116676008 |Associated morphology| = << 55641003 |Infarct|, 363698007 |Finding site| = << 40207001 |Myocardium| }` (multiple attributes in group)
   * - `[2..2] { 363698007 |Finding site| = * }` (cardinality-constrained group)
   */
  private eclAttributeGroup = this.RULE("eclAttributeGroup", () => {
    this.CONSUME(LBrace);
    this.SUBRULE(this.eclAttributeSet);
    this.CONSUME(RBrace);
  });

  /**
   * Parses an attribute set.
   *
   * An attribute set is a sequence of one or more attributes combined with logical operators
   * (AND, OR) or comma separators. Within an attribute group, these attributes are evaluated
   * together. The comma is treated as AND for convenience in attribute lists.
   *
   * @grammar eclAttributeSet ::= eclAttribute (('AND' | 'OR' | ',') eclAttribute)*
   *
   * @example
   * - `363698007 |Finding site| = << 39057004 |Pulmonary valve|` (single attribute)
   * - `116676008 |Associated morphology| = << 55641003 |Infarct| AND 363698007 |Finding site| = << 40207001 |Myocardium|` (multiple attributes with AND)
   * - `246075003 |Causative agent| = << 387517004 |Paracetamol|, 370135005 |Pathological process| = << 472964009 |Accidental overdose|` (comma-separated attributes)
   * - `(363698007 = << 39057004 OR 116676008 = << 55641003)` (parenthesized attribute set for precedence)
   */
  private eclAttributeSet = this.RULE("eclAttributeSet", () => {
    this.SUBRULE(this.subAttributeSet);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(And) },
        { ALT: () => this.CONSUME(Or) },
        { ALT: () => this.CONSUME(Comma) },
      ]);
      this.SUBRULE2(this.subAttributeSet);
    });
  });

  /**
   * Parses a sub-attribute set (single attribute or parenthesized attribute set).
   *
   * This rule allows attribute sets to be grouped with parentheses for controlling
   * operator precedence in complex attribute constraints. For example, to ensure OR
   * operations bind before AND, you can write: `attr1 = val1 AND (attr2 = val2 OR attr3 = val3)`.
   *
   * Note: Uses BACKTRACK to resolve ambiguity between parenthesized attribute sets and
   * attributes with nested expression names. The parenthesized attribute set alternative
   * is tried first with backtracking, falling back to eclAttribute if it doesn't match.
   *
   * @grammar subAttributeSet ::= eclAttribute | '(' eclAttributeSet ')'
   *
   * @example
   * - `363698007 = << 39057004` (single attribute)
   * - `(363698007 = << 39057004 OR 116676008 = << 55641003)` (parenthesized set for precedence)
   * - `((363698007 = << 39057004))` (nested parentheses)
   */
  private subAttributeSet = this.RULE("subAttributeSet", () => {
    this.OR([
      {
        // Try parenthesized attribute set first with backtracking
        // This resolves ambiguity with eclAttribute where attribute name is a nested expression
        GATE: this.BACKTRACK(this.parenthesizedAttributeSet),
        ALT: () => this.SUBRULE(this.parenthesizedAttributeSet),
      },
      { ALT: () => this.SUBRULE(this.eclAttribute) },
    ]);
  });

  /**
   * Helper rule for parsing parenthesized attribute sets.
   * Used with BACKTRACK to resolve ambiguity with eclAttribute.
   */
  private parenthesizedAttributeSet = this.RULE("parenthesizedAttributeSet", () => {
    this.CONSUME(LParen);
    this.SUBRULE(this.eclAttributeSet);
    this.CONSUME(RParen);
  });

  /**
   * Parses a single attribute constraint with optional reverse flag.
   *
   * An attribute constraint is a triple consisting of an attribute name, a comparator, and a value.
   * Optionally preceded by a reverse flag ('R' or 'reverseOf') that reverses the relationship direction.
   * The ECL specification supports four types of attribute values:
   * 1. Expression constraints (concept references)
   * 2. Numeric values (prefixed with #)
   * 3. String values (quoted text)
   * 4. Boolean values (true/false)
   *
   * @grammar eclAttribute ::= (reverseFlag)? eclAttributeName comparator (Hash numericValue | eclAttributeValue)
   * @grammar reverseFlag ::= 'R' | 'reverseOf'
   *
   * @example
   * - `363698007 |Finding site| = << 39057004 |Pulmonary valve|` (expression constraint)
   * - `111115 |Has dose strength| = #500` (numeric concrete value)
   * - `R 363698007 = << 125605004` (brief reverse syntax)
   * - `reverseOf 363698007 = << 125605004` (long reverse syntax)
   * - `<< 246075003 |Causative agent| = 387517004 |Paracetamol|` (attribute name with constraint operator)
   * - `370135005 |Pathological process| != << 441862004 |Infectious process|` (not-equals comparator)
   */
  private eclAttribute = this.RULE("eclAttribute", () => {
    // Optional reverse flag (R or reverseOf)
    this.OPTION(() => {
      this.OR([
        { ALT: () => this.CONSUME(Identifier, { LABEL: "ReverseR" }) },  // "R" identifier
        { ALT: () => this.CONSUME(ReverseOf) },  // "reverseOf" keyword
      ]);
    });

    this.SUBRULE(this.eclAttributeName);
    this.SUBRULE(this.comparator);

    // Check if this is a numeric concrete value (prefixed with #)
    this.OR2([
      {
        // Numeric value path: # followed by number
        ALT: () => {
          this.CONSUME(Hash);
          this.SUBRULE(this.numericValue);
        },
      },
      {
        // All other value types (expression, string, boolean)
        ALT: () => {
          this.SUBRULE(this.eclAttributeValue);
        },
      },
    ]);
  });

  /**
   * Parses an attribute name (without dotted paths).
   *
   * Attribute names are sub-expression constraints (without dotted notation), which means they can
   * include constraint operators (like << or <) to match multiple related attributes. This powerful
   * feature allows queries to match any attribute that is a descendant of a given concept, enabling
   * flexible attribute matching.
   *
   * Note: This rule is similar to subExpressionConstraint but excludes dotted path notation to avoid
   * recursion issues when used within dotted expressions.
   *
   * @grammar eclAttributeName ::= constraintOperator? eclFocusConcept filterConstraint*
   *
   * @example
   * - `363698007 |Finding site|` (simple attribute reference)
   * - `<< 246075003 |Causative agent|` (matches any descendant of Causative agent)
   * - `<< 363698007 |Finding site| {{ term = "pulmonary" }}` (attribute name with filter)
   */
  private eclAttributeName = this.RULE("eclAttributeName", () => {
    this.OPTION(() => {
      this.SUBRULE(this.constraintOperator);
    });
    this.SUBRULE(this.eclFocusConcept);
    this.MANY(() => {
      this.SUBRULE(this.filterConstraint);
    });
  });

  /**
   * Parses a comparator operator.
   *
   * Comparators define the relationship between attribute names and values. In addition to standard
   * equality and inequality operators, ECL reuses constraint operators (< and >) as comparators
   * for descendant/ancestor relationships. This allows both exact matches and hierarchical matching
   * within attribute constraints.
   *
   * @grammar comparator ::= '=' | '!=' | '<=' | '>=' | '<' | '>'
   *
   * @example
   * - `=` - Equals (exact match or descendant-or-self when combined with constraint operator on value)
   * - `!=` - Not equals (exclusion)
   * - `<` - Used as "descendantOf" comparator for concrete values or hierarchical matching
   */
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

  /**
   * Parses an attribute value.
   *
   * Attribute values can be concrete literals (string, boolean) or sub-expression constraints
   * (concept references with optional constraint operators). Sub-expressions allow hierarchical
   * matching, enabling queries that match any concept within a specified subtree. Concrete values
   * are tried first to avoid ambiguity.
   *
   * @grammar eclAttributeValue ::= StringLiteral | 'true' | 'false' | subExpressionConstraint
   *
   * @example
   * - `<< 39057004 |Pulmonary valve structure|` (sub-expression with constraint operator)
   * - `"Paracetamol"` (string literal value)
   * - `true` (boolean literal for active status)
   */
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

  /**
   * Parses a numeric concrete domain value.
   *
   * Numeric values can be integers or decimals, with optional sign prefix.
   * In ECL syntax, they are prefixed with # to distinguish from concept IDs.
   *
   * @grammar numericValue ::= DecimalValue | SignedInteger | Integer
   *
   * @example #500
   * @example #12.5
   * @example #-10
   * @example #+3.14
   */
  private numericValue = this.RULE("numericValue", () => {
    this.OR([
      { ALT: () => this.CONSUME(DecimalValue) },
      { ALT: () => this.CONSUME(SignedInteger) },
      { ALT: () => this.CONSUME(Integer) },
    ]);
  });

  /**
   * Parses a cardinality constraint.
   *
   * Cardinality specifies the minimum and maximum number of times an attribute or attribute group
   * can appear. The syntax is [min..max] where both min and max can be integers or wildcards (*).
   * A wildcard (*) in the max position means unbounded. This is essential for modeling clinical
   * scenarios where attributes can occur multiple times.
   *
   * @grammar cardinality ::= '[' (Integer | '*') '..' (Integer | '*') ']'
   *
   * @example
   * - `[1..1]` - Exactly one occurrence (cardinality-constrained to single)
   * - `[0..*]` - Zero or more occurrences (unbounded)
   * - `[2..3]` - Between 2 and 3 occurrences (bounded range)
   */
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

  /**
   * Parses a filter constraint.
   *
   * Filter constraints are enclosed in double braces {{ }} and refine concept sets based on
   * description properties rather than logical relationships. Filters can match on terms,
   * languages, dialects, types, module IDs, effective times, active status, and definition status.
   * Multiple filters can be combined within a single constraint.
   *
   * @grammar filterConstraint ::= '{{' filterExpressionConstraint '}}'
   *
   * @example
   * - `{{ term = "diabetes" }}` (term filter)
   * - `{{ language = en }}` (language filter)
   * - `{{ term = "disorder", active = true }}` (multiple filters combined)
   */
  private filterConstraint = this.RULE("filterConstraint", () => {
    this.CONSUME(DoubleLBrace);
    this.SUBRULE(this.filterExpressionConstraint);
    this.CONSUME(DoubleRBrace);
  });

  /**
   * Parses a filter expression constraint.
   *
   * A filter expression is a sequence of one or more individual filters combined with logical
   * operators (AND, OR) or comma separators. This allows complex filtering criteria to be
   * expressed, enabling precise selection of descriptions and concepts based on metadata properties.
   *
   * @grammar filterExpressionConstraint ::= filter (('AND' | 'OR' | ',') filter)*
   *
   * @example
   * - `term = "diabetes"` (single filter)
   * - `term = "disorder" AND language = en` (multiple filters with AND)
   * - `active = true, language = en, dialect = en-us` (comma-separated filters)
   */
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

  /**
   * Parses an individual filter.
   *
   * This is a dispatcher rule that routes to specific filter types based on the filter keyword.
   * ECL supports seven types of filters: term (text matching), language (language codes),
   * type (description types), dialect (regional variations), module (module IDs), active
   * (active status), and definitionStatus (primitive vs defined concepts).
   *
   * @grammar filter ::= termFilter | languageFilter | typeFilter | dialectFilter
   *                    | moduleFilter | activeFilter | definitionStatusFilter
   *
   * @example
   * - `term = "diabetes"` (routes to termFilter)
   * - `language = en` (routes to languageFilter)
   * - `active = true` (routes to activeFilter)
   */
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

  /**
   * Parses a term filter.
   *
   * Term filters match concepts based on their description text. They support optional match
   * operators (match: for exact matching, wild: for wildcard patterns) and can accept either
   * a single string value or multiple values in parentheses. This is one of the most commonly
   * used filters for text-based concept searches.
   *
   * @grammar termFilter ::= 'term' '=' ('match' | 'wild')? ':' (StringLiteral | '(' StringLiteral+ ')')
   *
   * @example
   * - `term = "diabetes"` (simple term match)
   * - `term = match:"diabetes mellitus"` (exact match with match operator)
   * - `term = wild:"*diabet*"` (wildcard pattern matching)
   * - `term = ("diabetes" "mellitus")` (multiple term values)
   */
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
    // String value(s) can optionally be wrapped in parentheses (multiple values allowed)
    this.OR2([
      {
        ALT: () => {
          this.CONSUME(LParen);
          this.AT_LEAST_ONE(() => {
            this.CONSUME(StringLiteral);
          });
          this.CONSUME(RParen);
        },
      },
      { ALT: () => this.CONSUME2(StringLiteral) },
    ]);
  });

  /**
   * Parses a language filter.
   *
   * Language filters restrict results to descriptions in a specific language using two-letter
   * ISO 639-1 language codes. This is essential for international SNOMED CT implementations
   * that support multiple languages and need to filter descriptions by language.
   *
   * @grammar languageFilter ::= 'language' '=' DialectAlias
   *
   * @example
   * - `language = en` (English language descriptions)
   * - `language = es` (Spanish language descriptions)
   * - `language = fr` (French language descriptions)
   */
  private languageFilter = this.RULE("languageFilter", () => {
    this.CONSUME(Language);
    this.CONSUME(Equals);
    this.CONSUME(DialectAlias);
  });

  /**
   * Parses a type filter.
   *
   * Type filters restrict results based on description type (synonym, fully specified name, etc.).
   * The filter can use predefined keywords (preferred, acceptable) or reference specific description
   * type concepts by SCTID. This allows queries to target specific kinds of clinical terminology.
   *
   * @grammar typeFilter ::= 'type' '=' ('preferred' | 'acceptable' | eclConceptReference)
   *
   * @example
   * - `type = preferred` (preferred descriptions only)
   * - `type = acceptable` (acceptable descriptions)
   * - `type = 900000000000003001` (fully specified name type by SCTID)
   */
  private typeFilter = this.RULE("typeFilter", () => {
    this.CONSUME(TypeKeyword);
    this.CONSUME(Equals);
    this.OR([
      { ALT: () => this.CONSUME(Preferred) },
      { ALT: () => this.CONSUME(Acceptable) },
      { ALT: () => this.SUBRULE(this.eclConceptReference) },
    ]);
  });

  /**
   * Parses a dialect filter.
   *
   * Dialect filters select descriptions based on regional language variations (e.g., en-us, en-gb).
   * The value can be a dialect alias or concept reference. Optionally, an acceptability qualifier
   * (preferred or acceptable) in parentheses further refines the filter based on the description's
   * acceptability status within that dialect.
   *
   * @grammar dialectFilter ::= 'dialect' '=' (DialectAlias | eclConceptReference) ('(' ('preferred' | 'acceptable') ')')?
   *
   * @example
   * - `dialect = en-us` (US English dialect)
   * - `dialect = en-gb (preferred)` (GB English preferred terms)
   * - `dialect = 900000000000509007 (acceptable)` (dialect by concept reference with acceptability)
   */
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

  /**
   * Parses a module filter.
   *
   * Module filters restrict results to concepts or descriptions from specific SNOMED CT modules.
   * Modules represent different content packages or extensions (e.g., core module, national extensions).
   * This is useful for filtering content by authoring organization or edition.
   *
   * @grammar moduleFilter ::= 'moduleId' '=' eclConceptReference
   *
   * @example
   * - `moduleId = 900000000000207008` (core SNOMED CT module)
   * - `moduleId = 731000124108` (US Edition module)
   * - `moduleId = 999000011000000103` (UK Extension module)
   */
  private moduleFilter = this.RULE("moduleFilter", () => {
    this.CONSUME(ModuleId);
    this.CONSUME(Equals);
    this.SUBRULE(this.eclConceptReference);
  });

  /**
   * Parses an active filter.
   *
   * Active filters restrict results to concepts or descriptions based on their active status
   * (active = true) or inactive/retired status (active = false). This is crucial for excluding
   * deprecated or retired terminology from queries and ensuring only current, valid terms are used.
   *
   * @grammar activeFilter ::= 'active' '=' ('true' | 'false')
   *
   * @example
   * - `active = true` (only active concepts/descriptions)
   * - `active = false` (only inactive/retired concepts/descriptions)
   */
  private activeFilter = this.RULE("activeFilter", () => {
    this.CONSUME(Active);
    this.CONSUME(Equals);
    this.OR([
      { ALT: () => this.CONSUME(True) },
      { ALT: () => this.CONSUME(False) },
    ]);
  });

  /**
   * Parses a definition status filter.
   *
   * Definition status filters distinguish between primitive concepts (those with necessary but not
   * sufficient conditions) and fully defined concepts (those with necessary and sufficient conditions).
   * This distinction is fundamental to SNOMED CT's description logic semantics and affects subsumption
   * relationships. The filter can use keywords (primitive, defined) or reference definition status concepts by SCTID.
   *
   * @grammar definitionStatusFilter ::= 'definitionStatusId' '=' ('primitive' | 'defined' | eclConceptReference)
   *
   * @example
   * - `definitionStatusId = primitive` (primitive concepts only)
   * - `definitionStatusId = defined` (fully defined concepts only)
   * - `definitionStatusId = 900000000000074008` (primitive status by SCTID)
   */
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

/**
 * Parses ECL tokens into a Concrete Syntax Tree (CST).
 *
 * This is the main entry point for parsing ECL expressions. It takes a token array
 * from the lexer, parses it using the singleton parser instance, and returns both
 * the CST and any parsing errors encountered. The parser uses error recovery to
 * continue parsing even when syntax errors are found.
 *
 * @param tokens - Array of tokens produced by the ECL lexer
 * @returns Object containing the CST and array of parsing errors (if any)
 *
 * @example
 * ```typescript
 * import { lex } from './lexer';
 * import { parse } from './parser';
 *
 * const tokens = lex('<< 73211009 |Diabetes mellitus|');
 * const { cst, errors } = parse(tokens.tokens);
 * if (errors.length === 0) {
 *   console.log('Parse successful:', cst);
 * }
 * ```
 */
export function parse(tokens: IToken[]) {
  parser.input = tokens;
  const cst = parser.expressionConstraint();
  return {
    cst,
    errors: parser.errors,
  };
}
