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

// Sub-expression: optional constraint operator + focus concept + optional filter
export interface SubExpression extends AstNode {
  type: "SubExpression";
  constraintOperator?: ConstraintOperator;
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

// Focus concept: concept reference, wildcard, or nested expression
export type FocusConcept =
  | ConceptReference
  | WildcardConcept
  | AlternateIdentifier
  | NestedExpression;

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

export type RefinementItem = AttributeGroup | Attribute;

// Attribute group: { attributes }
export interface AttributeGroup extends AstNode {
  type: "AttributeGroup";
  cardinality?: Cardinality;
  attributes: Attribute[];
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

// Attribute name: concept reference or wildcard
export type AttributeName = ConceptReference | WildcardConcept;

// Attribute value: expression constraint or concrete value
export type AttributeValue =
  | SubExpression
  | RefinedExpression
  | CompoundExpression
  | NestedExpression
  | StringValue
  | NumberValue
  | BooleanValue;

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
  value: string;
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
