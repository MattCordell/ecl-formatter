/**
 * AST Node Types for SNOMED CT Expression Constraint Language
 */

// Base interface for all AST nodes
export interface AstNode {
  type: string;
}

// Root expression constraint
export interface ExpressionConstraint extends AstNode {
  type: "ExpressionConstraint";
  expression:
    | CompoundExpression
    | RefinedExpression
    | SubExpression;
}

// Compound expression: left AND|OR|MINUS right
export interface CompoundExpression extends AstNode {
  type: "CompoundExpression";
  operator: "AND" | "OR" | "MINUS";
  left: CompoundExpression | RefinedExpression | SubExpression;
  right: CompoundExpression | RefinedExpression | SubExpression;
}

// Refined expression: subExpression : refinement
export interface RefinedExpression extends AstNode {
  type: "RefinedExpression";
  expression: SubExpression;
  refinement: Refinement;
}

// Sub-expression: optional constraint operator + optional memberOf + focus concept + optional filter
export interface SubExpression extends AstNode {
  type: "SubExpression";
  constraintOperator?: ConstraintOperator;
  memberOf?: boolean; // True when ^ (memberOf) operator is present after constraint operator
  focusConcept: FocusConcept;
  filters?: Filter[];
}

// Constraint operator (brief or long form)
export interface ConstraintOperator extends AstNode {
  type: "ConstraintOperator";
  operator:
    | "<"
    | "<<"
    | "<!"
    | "<<!"
    | ">"
    | ">>"
    | ">!"
    | ">>!"
    | "^"
    | "descendantOf"
    | "descendantOrSelfOf"
    | "childOf"
    | "childOrSelfOf"
    | "ancestorOf"
    | "ancestorOrSelfOf"
    | "parentOf"
    | "parentOrSelfOf"
    | "memberOf";
}

// Dotted attribute path: base.attribute1.attribute2...
// Represents chained attribute navigation (e.g., < 125605004 . 363698007)
// Semantically equivalent to reverse syntax: x . a = * : R a = x
// Forward declaration needed before FocusConcept
export interface DottedAttributePath extends AstNode {
  type: "DottedAttributePath";
  base: SubExpression;  // Starting expression
  attributes: SubExpression[];  // Chained attributes (at least one)
}

// Focus concept: concept reference, wildcard, nested expression, or dotted path
export type FocusConcept =
  | ConceptReference
  | WildcardConcept
  | AlternateIdentifier
  | NestedExpression
  | DottedAttributePath;

// Concept reference with SCTID and optional term
export interface ConceptReference extends AstNode {
  type: "ConceptReference";
  sctId: string;
  term?: string;
}

// Wildcard *
export interface WildcardConcept extends AstNode {
  type: "WildcardConcept";
}

// Alternate identifier: SCHEME#code
export interface AlternateIdentifier extends AstNode {
  type: "AlternateIdentifier";
  scheme: string;
  code: string;
}

// Nested expression in parentheses
export interface NestedExpression extends AstNode {
  type: "NestedExpression";
  expression: ExpressionConstraint["expression"];
}

// Refinement: attribute sets and/or attribute groups
export interface Refinement extends AstNode {
  type: "Refinement";
  items: RefinementItem[];
  conjunctions: ("AND" | "OR" | ",")[];
}

export type RefinementItem = AttributeGroup | AttributeSetItem;

// Union type for items that can appear in an attribute set
export type AttributeSetItem = Attribute | NestedAttributeSet;

// Attribute group: { attributes }
export interface AttributeGroup extends AstNode {
  type: "AttributeGroup";
  cardinality?: Cardinality;
  items: AttributeSetItem[];
  conjunctions: ("AND" | "OR" | ",")[];
}

// Single attribute: name comparator value
export interface Attribute extends AstNode {
  type: "Attribute";
  cardinality?: Cardinality;
  reverseFlag?: boolean;
  name: AttributeName;
  comparator: "=" | "!=" | "<" | "<=" | ">" | ">=";
  value: AttributeValue;
}

// Nested attribute set in parentheses (for precedence grouping)
export interface NestedAttributeSet extends AstNode {
  type: "NestedAttributeSet";
  items: AttributeSetItem[];
  conjunctions: ("AND" | "OR" | ",")[];
}

// Attribute name: concept reference, wildcard, or dotted path
// Attribute name can be a full sub-expression (e.g., << 127489000)
// or a dotted attribute path (e.g., x . a . b)
export type AttributeName = SubExpression | DottedAttributePath;

// Attribute value: expression constraint or concrete value
export type AttributeValue =
  | SubExpression
  | RefinedExpression
  | CompoundExpression
  | NestedExpression
  | TypedSearchTerm
  | TypedSearchTermSet
  | StringValue
  | NumberValue
  | BooleanValue;

// Typed search term: string value with optional match/wild search type
// Used in attribute values for string matching (e.g., * : * = "heart")
export interface TypedSearchTerm extends AstNode {
  type: "TypedSearchTerm";
  searchType: "match" | "wild";
  value: string;
}

// Typed search term set: multiple search terms in parentheses
// Used for matching any of multiple strings (e.g., * : * = ("heart" "liver"))
export interface TypedSearchTermSet extends AstNode {
  type: "TypedSearchTermSet";
  terms: TypedSearchTerm[];
}

// Concrete values
export interface StringValue extends AstNode {
  type: "StringValue";
  value: string;
}

export interface NumberValue extends AstNode {
  type: "NumberValue";
  value: number;
}

export interface BooleanValue extends AstNode {
  type: "BooleanValue";
  value: boolean;
}

// Cardinality: [min..max]
export interface Cardinality extends AstNode {
  type: "Cardinality";
  min: number | "*";
  max: number | "*";
}

// Filter: {{ filterConstraints }}
export interface Filter extends AstNode {
  type: "Filter";
  constraints: FilterConstraint[];
  conjunctions: ("AND" | "OR")[];
}

export type FilterConstraint =
  | TermFilter
  | LanguageFilter
  | TypeFilter
  | DialectFilter
  | ModuleFilter
  | EffectiveTimeFilter
  | ActiveFilter
  | DefinitionStatusFilter;

export interface TermFilter extends AstNode {
  type: "TermFilter";
  operator?: "match" | "wild";
  values: string[];
}

export interface LanguageFilter extends AstNode {
  type: "LanguageFilter";
  value: string;
}

export interface TypeFilter extends AstNode {
  type: "TypeFilter";
  value: "PREFERRED" | "ACCEPTABLE" | ConceptReference;
}

export interface DialectFilter extends AstNode {
  type: "DialectFilter";
  value: string | ConceptReference;
  acceptability?: "PREFERRED" | "ACCEPTABLE";
}

export interface ModuleFilter extends AstNode {
  type: "ModuleFilter";
  value: ConceptReference;
}

export interface EffectiveTimeFilter extends AstNode {
  type: "EffectiveTimeFilter";
  comparator: "=" | "!=" | "<" | "<=" | ">" | ">=";
  value: string;
}

export interface ActiveFilter extends AstNode {
  type: "ActiveFilter";
  value: boolean;
}

export interface DefinitionStatusFilter extends AstNode {
  type: "DefinitionStatusFilter";
  value: "PRIMITIVE" | "DEFINED" | ConceptReference;
}

// Union type for all expression types
export type Expression =
  | ExpressionConstraint
  | CompoundExpression
  | RefinedExpression
  | SubExpression;

// Type guard functions
export function isCompoundExpression(node: AstNode): node is CompoundExpression {
  return node.type === "CompoundExpression";
}

export function isRefinedExpression(node: AstNode): node is RefinedExpression {
  return node.type === "RefinedExpression";
}

export function isSubExpression(node: AstNode): node is SubExpression {
  return node.type === "SubExpression";
}

export function isNestedExpression(node: AstNode): node is NestedExpression {
  return node.type === "NestedExpression";
}

export function isConceptReference(node: AstNode): node is ConceptReference {
  return node.type === "ConceptReference";
}

export function isWildcardConcept(node: AstNode): node is WildcardConcept {
  return node.type === "WildcardConcept";
}

export function isAttributeGroup(node: AstNode): node is AttributeGroup {
  return node.type === "AttributeGroup";
}

export function isAttribute(node: AstNode): node is Attribute {
  return node.type === "Attribute";
}

export function isNestedAttributeSet(node: AstNode): node is NestedAttributeSet {
  return node.type === "NestedAttributeSet";
}

export function isTypedSearchTerm(node: AstNode): node is TypedSearchTerm {
  return node.type === "TypedSearchTerm";
}

export function isTypedSearchTermSet(node: AstNode): node is TypedSearchTermSet {
  return node.type === "TypedSearchTermSet";
}
