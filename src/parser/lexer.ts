import { createToken, Lexer, ITokenConfig } from "chevrotain";

/**
 * Whitespace token (spaces, tabs, newlines).
 *
 * Automatically skipped by the lexer and not included in the token stream.
 *
 * @pattern /\s+/
 */
export const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

/**
 * Block comment token (C-style comments).
 *
 * Automatically skipped by the lexer. Preserving comments in formatted output
 * would require parser modifications to track comment positions.
 *
 * @example /&#42; This is a comment &#42;/
 * @pattern /\/&#42;[\s\S]&#42;?&#42;\//
 */
export const BlockComment = createToken({
  name: "BlockComment",
  pattern: /\/\*[\s\S]*?\*\//,
  group: Lexer.SKIPPED,
});

/**
 * Double left brace delimiter for filters.
 *
 * Used to open filter expressions in ECL. Must be defined before single
 * left brace to ensure correct tokenization.
 *
 * @example {{ term = "heart" }}
 * @pattern /\{\{/
 * @see DoubleRBrace
 */
export const DoubleLBrace = createToken({
  name: "DoubleLBrace",
  pattern: /\{\{/,
});

/**
 * Double right brace delimiter for filters.
 *
 * Used to close filter expressions in ECL. Must be defined before single
 * right brace to ensure correct tokenization.
 *
 * @example {{ term = "heart" }}
 * @pattern /\}\}/
 * @see DoubleLBrace
 */
export const DoubleRBrace = createToken({
  name: "DoubleRBrace",
  pattern: /\}\}/,
});

/**
 * Child-or-self-of constraint operator (brief syntax).
 *
 * Matches concepts that are immediate children of OR equal to the specified
 * concept in the SNOMED CT hierarchy.
 *
 * @example <<! 404684003 |Clinical finding|
 * @pattern /<<!/
 * @see ChildOrSelfOfKeyword for long-form syntax
 */
export const ChildOrSelfOf = createToken({
  name: "ChildOrSelfOf",
  pattern: /<<!/,
});

/**
 * Descendant-or-self-of constraint operator (brief syntax).
 *
 * Matches concepts that are descendants of OR equal to the specified concept
 * in the SNOMED CT hierarchy. This is the most commonly used constraint operator.
 *
 * @example << 404684003 |Clinical finding|
 * @example << *
 * @pattern /<</
 * @see DescendantOrSelfOfKeyword for long-form syntax
 */
export const DescendantOrSelfOf = createToken({
  name: "DescendantOrSelfOf",
  pattern: /<</,
});

/**
 * Child-of constraint operator (brief syntax).
 *
 * Matches concepts that are immediate children of the specified concept
 * (excludes the concept itself).
 *
 * @example <! 404684003 |Clinical finding|
 * @pattern /<!/
 * @see ChildOfKeyword for long-form syntax
 */
export const ChildOf = createToken({
  name: "ChildOf",
  pattern: /<!/,
});

/**
 * Parent-or-self-of constraint operator (brief syntax).
 *
 * Matches concepts that are immediate parents of OR equal to the specified
 * concept in the SNOMED CT hierarchy.
 *
 * @example >>! 39057004 |Pulmonary emphysema|
 * @pattern />>!/
 * @see ParentOrSelfOfKeyword for long-form syntax
 */
export const ParentOrSelfOf = createToken({
  name: "ParentOrSelfOf",
  pattern: />>!/,
});

/**
 * Ancestor-or-self-of constraint operator (brief syntax).
 *
 * Matches concepts that are ancestors of OR equal to the specified concept
 * in the SNOMED CT hierarchy.
 *
 * @example >> 39057004 |Pulmonary emphysema|
 * @pattern />>/
 * @see AncestorOrSelfOfKeyword for long-form syntax
 */
export const AncestorOrSelfOf = createToken({
  name: "AncestorOrSelfOf",
  pattern: />>/,
});

/**
 * Parent-of constraint operator (brief syntax).
 *
 * Matches concepts that are immediate parents of the specified concept
 * (excludes the concept itself).
 *
 * @example >! 39057004 |Pulmonary emphysema|
 * @pattern />!/
 * @see ParentOfKeyword for long-form syntax
 */
export const ParentOf = createToken({
  name: "ParentOf",
  pattern: />!/,
});

/**
 * Member-of constraint operator (brief syntax).
 *
 * Matches concepts that are members of the specified reference set.
 *
 * @example ^ 700043003 |Example reference set|
 * @pattern /\^/
 * @see MemberOfKeyword for long-form syntax
 */
export const MemberOf = createToken({
  name: "MemberOf",
  pattern: /\^/,
});

/**
 * Not-equals comparison operator.
 *
 * Used in refinements to specify that an attribute value must not equal
 * a particular value.
 *
 * @example : 363698007 != << 39057004
 * @pattern /!=/
 */
export const NotEquals = createToken({
  name: "NotEquals",
  pattern: /!=/,
});

/**
 * Less-than-or-equals comparison operator.
 *
 * Used in refinements to constrain numeric attribute values.
 *
 * @example : 363698007 <= 100
 * @pattern /<=/
 */
export const LessThanOrEquals = createToken({
  name: "LessThanOrEquals",
  pattern: /<=/,
});

/**
 * Greater-than-or-equals comparison operator.
 *
 * Used in attribute refinements to constrain numeric values.
 *
 * @example >= 100
 * @pattern />=/
 */
export const GreaterThanOrEquals = createToken({
  name: "GreaterThanOrEquals",
  pattern: />=/,
});

/**
 * Equals operator.
 *
 * Used in attribute refinements, filter expressions, and cardinality constraints.
 *
 * @example : 363698007 = << 39057004
 * @example {{ term = "heart" }}
 * @pattern /=/
 */
export const Equals = createToken({
  name: "Equals",
  pattern: /=/,
});

/**
 * Descendant-of constraint operator (brief syntax).
 *
 * Matches concepts that are descendants of the specified concept (excludes the
 * concept itself). Also used as less-than comparison operator in refinements.
 *
 * @example < 404684003 |Clinical finding|
 * @example : 363698007 < 100
 * @pattern /</
 * @see DescendantOfKeyword for long-form syntax
 */
export const DescendantOf = createToken({
  name: "DescendantOf",
  pattern: /</,
});

/**
 * Ancestor-of constraint operator (brief syntax).
 *
 * Matches concepts that are ancestors of the specified concept (excludes the
 * concept itself). Also used as greater-than comparison operator in refinements.
 *
 * @example > 39057004 |Pulmonary emphysema|
 * @example : 363698007 > 100
 * @pattern />/
 * @see AncestorOfKeyword for long-form syntax
 */
export const AncestorOf = createToken({
  name: "AncestorOf",
  pattern: />/,
});

/**
 * Wildcard token.
 *
 * Represents "any concept" in ECL expressions, matching all concepts in SNOMED CT.
 * Also used in cardinality to represent unlimited upper bound.
 *
 * @example << &#42;
 * @example [0..&#42;]
 * @pattern /\&#42;/
 */
export const Wildcard = createToken({
  name: "Wildcard",
  pattern: /\*/,
});

/**
 * Logical AND operator (case-insensitive).
 *
 * Combines two constraints where both conditions must be satisfied.
 * Accepts any case variant (AND, and, And, etc.) but normalizes to uppercase in output.
 *
 * @example << 404684003 AND << 373873005
 * @example << 19829001 : 363698007 = << 39057004 AND 116676008 = << 72704001
 * @pattern /AND/i
 */
export const And = createToken({
  name: "And",
  pattern: /AND/i,
});

/**
 * Logical OR operator (case-insensitive).
 *
 * Combines two constraints where either condition can be satisfied.
 * Accepts any case variant (OR, or, Or, etc.) but normalizes to uppercase in output.
 *
 * @example << 404684003 OR << 373873005
 * @example << 19829001 : 363698007 = << 39057004 OR 363698007 = << 72704001
 * @pattern /OR/i
 */
export const Or = createToken({
  name: "Or",
  pattern: /OR/i,
});

/**
 * Logical MINUS operator (case-insensitive, exclusion).
 *
 * Excludes concepts matching the second constraint from the first constraint.
 * Accepts any case variant (MINUS, minus, Minus, etc.) but normalizes to uppercase in output.
 *
 * @example << 404684003 MINUS << 283682007
 * @example << 19829001 MINUS ^ 700043003
 * @pattern /MINUS/i
 */
export const Minus = createToken({
  name: "Minus",
  pattern: /MINUS/i,
});

/**
 * Descendant-of constraint operator (long-form syntax).
 *
 * Verbose alternative to the < operator. Matches concepts that are descendants
 * of the specified concept (excludes the concept itself).
 *
 * @example descendantOf 404684003 |Clinical finding|
 * @pattern /descendantOf/
 * @see DescendantOf for brief syntax
 */
export const DescendantOfKeyword = createToken({
  name: "DescendantOfKeyword",
  pattern: /descendantOf/,
});

/**
 * Descendant-or-self-of constraint operator (long-form syntax).
 *
 * Verbose alternative to the << operator. Matches concepts that are descendants
 * of OR equal to the specified concept. Most commonly used constraint in ECL.
 *
 * @example descendantOrSelfOf 404684003 |Clinical finding|
 * @pattern /descendantOrSelfOf/
 * @see DescendantOrSelfOf for brief syntax
 */
export const DescendantOrSelfOfKeyword = createToken({
  name: "DescendantOrSelfOfKeyword",
  pattern: /descendantOrSelfOf/,
});

/**
 * Child-of constraint operator (long-form syntax).
 *
 * Verbose alternative to the <! operator. Matches immediate children of the
 * specified concept (excludes the concept itself).
 *
 * @example childOf 404684003 |Clinical finding|
 * @pattern /childOf/
 * @see ChildOf for brief syntax
 */
export const ChildOfKeyword = createToken({
  name: "ChildOfKeyword",
  pattern: /childOf/,
});

/**
 * Child-or-self-of constraint operator (long-form syntax).
 *
 * Verbose alternative to the <<! operator. Matches immediate children of OR
 * equal to the specified concept.
 *
 * @example childOrSelfOf 404684003 |Clinical finding|
 * @pattern /childOrSelfOf/
 * @see ChildOrSelfOf for brief syntax
 */
export const ChildOrSelfOfKeyword = createToken({
  name: "ChildOrSelfOfKeyword",
  pattern: /childOrSelfOf/,
});

/**
 * Ancestor-of constraint operator (long-form syntax).
 *
 * Verbose alternative to the > operator. Matches concepts that are ancestors
 * of the specified concept (excludes the concept itself).
 *
 * @example ancestorOf 39057004 |Pulmonary emphysema|
 * @pattern /ancestorOf/
 * @see AncestorOf for brief syntax
 */
export const AncestorOfKeyword = createToken({
  name: "AncestorOfKeyword",
  pattern: /ancestorOf/,
});

/**
 * Ancestor-or-self-of constraint operator (long-form syntax).
 *
 * Verbose alternative to the >> operator. Matches concepts that are ancestors
 * of OR equal to the specified concept.
 *
 * @example ancestorOrSelfOf 39057004 |Pulmonary emphysema|
 * @pattern /ancestorOrSelfOf/
 * @see AncestorOrSelfOf for brief syntax
 */
export const AncestorOrSelfOfKeyword = createToken({
  name: "AncestorOrSelfOfKeyword",
  pattern: /ancestorOrSelfOf/,
});

/**
 * Parent-of constraint operator (long-form syntax).
 *
 * Verbose alternative to the >! operator. Matches immediate parents of the
 * specified concept (excludes the concept itself).
 *
 * @example parentOf 39057004 |Pulmonary emphysema|
 * @pattern /parentOf/
 * @see ParentOf for brief syntax
 */
export const ParentOfKeyword = createToken({
  name: "ParentOfKeyword",
  pattern: /parentOf/,
});

/**
 * Parent-or-self-of constraint operator (long-form syntax).
 *
 * Verbose alternative to the >>! operator. Matches immediate parents of OR
 * equal to the specified concept.
 *
 * @example parentOrSelfOf 39057004 |Pulmonary emphysema|
 * @pattern /parentOrSelfOf/
 * @see ParentOrSelfOf for brief syntax
 */
export const ParentOrSelfOfKeyword = createToken({
  name: "ParentOrSelfOfKeyword",
  pattern: /parentOrSelfOf/,
});

/**
 * Member-of constraint operator (long-form syntax).
 *
 * Verbose alternative to the ^ operator. Matches concepts that are members
 * of the specified reference set.
 *
 * @example memberOf 700043003 |Example reference set|
 * @pattern /memberOf/
 * @see MemberOf for brief syntax
 */
export const MemberOfKeyword = createToken({
  name: "MemberOfKeyword",
  pattern: /memberOf/,
});

/**
 * ReverseOf keyword for reverse attribute navigation (long-form, case-insensitive).
 *
 * Brief syntax uses 'R' which is captured as Identifier.
 * Long syntax uses 'reverseOf' keyword. Both uppercase and lowercase variants accepted.
 *
 * Used in refinements to reverse attribute relationship direction.
 * Reverses the attribute navigation: instead of "X has attribute Y", expresses "Y is attribute of X".
 *
 * @example reverseOf 363698007 |Finding site|
 * @example << 91723000 : reverseOf 363698007 = << 125605004
 * @pattern /reverseOf/i
 */
export const ReverseOf = createToken({
  name: "ReverseOf",
  pattern: /reverseOf/i,
});

/**
 * Term filter keyword.
 *
 * Used in description filters to match against concept term text.
 *
 * @example {{ term = "heart" }}
 * @example {{ term match "diabet*" }}
 * @pattern /term/
 */
export const Term = createToken({
  name: "TermKeyword",
  pattern: /term/,
});

/**
 * Language filter keyword.
 *
 * Used in description filters to constrain matches by language code.
 *
 * @example {{ language = en }}
 * @example {{ term = "heart" AND language = en }}
 * @pattern /language/
 */
export const Language = createToken({
  name: "Language",
  pattern: /language/,
});

/**
 * Type filter keyword (typeId or type).
 *
 * Used in description filters to constrain by description type (FSN, synonym, etc.).
 *
 * @example {{ typeId = 900000000000003001 }}
 * @example {{ type = << 900000000000003001 }}
 * @pattern /typeId|type/
 */
export const TypeKeyword = createToken({
  name: "TypeKeyword",
  pattern: /typeId|type/,
});

/**
 * Dialect filter keyword (dialectId or dialect).
 *
 * Used in description filters to constrain by dialect or acceptability in a dialect.
 *
 * @example {{ dialectId = 900000000000509007 }}
 * @example {{ dialect = en-US (PREFERRED) }}
 * @pattern /dialectId|dialect/
 */
export const Dialect = createToken({
  name: "Dialect",
  pattern: /dialectId|dialect/,
});

/**
 * ModuleId filter keyword.
 *
 * Used in concept or description filters to constrain by SNOMED CT module.
 *
 * @example {{ moduleId = 900000000000207008 }}
 * @pattern /moduleId/
 */
export const ModuleId = createToken({
  name: "ModuleId",
  pattern: /moduleId/,
});

/**
 * EffectiveTime filter keyword.
 *
 * Used in concept or description filters to constrain by effective time (version date).
 *
 * @example {{ effectiveTime = "20190731" }}
 * @pattern /effectiveTime/
 */
export const EffectiveTime = createToken({
  name: "EffectiveTime",
  pattern: /effectiveTime/,
});

/**
 * Active filter keyword.
 *
 * Used in concept or description filters to constrain by active status.
 *
 * @example {{ active = true }}
 * @example {{ active = false }}
 * @pattern /active/
 */
export const Active = createToken({
  name: "Active",
  pattern: /active/,
});

/**
 * DefinitionStatusId filter keyword.
 *
 * Used in concept filters to constrain by definition status (primitive vs defined).
 *
 * @example {{ definitionStatusId = DEFINED }}
 * @example {{ definitionStatusId = PRIMITIVE }}
 * @pattern /definitionStatusId/
 */
export const DefinitionStatusId = createToken({
  name: "DefinitionStatusId",
  pattern: /definitionStatusId/,
});

/**
 * PREFERRED acceptability value.
 *
 * Used in dialect filters to specify preferred acceptability in a dialect.
 *
 * @example {{ dialect = en-US (PREFERRED) }}
 * @pattern /PREFERRED/
 */
export const Preferred = createToken({
  name: "Preferred",
  pattern: /PREFERRED/,
});

/**
 * ACCEPTABLE acceptability value.
 *
 * Used in dialect filters to specify acceptable (but not preferred) acceptability.
 *
 * @example {{ dialect = en-GB (ACCEPTABLE) }}
 * @pattern /ACCEPTABLE/
 */
export const Acceptable = createToken({
  name: "Acceptable",
  pattern: /ACCEPTABLE/,
});

/**
 * PRIMITIVE definition status value.
 *
 * Used in definitionStatusId filters to match primitive concepts (necessary but not sufficient conditions).
 *
 * @example {{ definitionStatusId = PRIMITIVE }}
 * @pattern /PRIMITIVE/
 */
export const Primitive = createToken({
  name: "Primitive",
  pattern: /PRIMITIVE/,
});

/**
 * DEFINED definition status value.
 *
 * Used in definitionStatusId filters to match fully defined concepts (necessary and sufficient conditions).
 *
 * @example {{ definitionStatusId = DEFINED }}
 * @pattern /DEFINED/
 */
export const Defined = createToken({
  name: "Defined",
  pattern: /DEFINED/,
});

/**
 * Match keyword for wildcard term matching.
 *
 * Used with term filters to enable wildcard pattern matching.
 *
 * @example {{ term match "diabet*" }}
 * @example {{ term match "*infarct*" }}
 * @pattern /match/
 */
export const Match = createToken({
  name: "Match",
  pattern: /match/,
});

/**
 * Wild keyword for case-insensitive wildcard matching.
 *
 * Used with term filters for case-insensitive wildcard matching.
 *
 * @example {{ term wild "DIABET*" }}
 * @pattern /wild/
 */
export const Wild = createToken({
  name: "Wild",
  pattern: /wild/,
});

/**
 * Boolean true literal.
 *
 * Used in filter expressions for boolean-valued attributes like active status.
 *
 * @example {{ active = true }}
 * @pattern /true/
 */
export const True = createToken({
  name: "True",
  pattern: /true/,
});

/**
 * Boolean false literal.
 *
 * Used in filter expressions for boolean-valued attributes like active status.
 *
 * @example {{ active = false }}
 * @pattern /false/
 */
export const False = createToken({
  name: "False",
  pattern: /false/,
});

/**
 * Left parenthesis delimiter.
 *
 * Used for grouping expressions and specifying operator precedence.
 *
 * @example (<< 404684003 OR << 373873005) AND << 64572001
 * @pattern /\(/
 */
export const LParen = createToken({
  name: "LParen",
  pattern: /\(/,
});

/**
 * Right parenthesis delimiter.
 *
 * Closes grouped expressions.
 *
 * @example (<< 404684003 OR << 373873005) AND << 64572001
 * @pattern /\)/
 */
export const RParen = createToken({
  name: "RParen",
  pattern: /\)/,
});

/**
 * Left brace delimiter.
 *
 * Opens attribute refinement groups.
 *
 * @example << 64572001 : { 363698007 = << 39057004 }
 * @pattern /\{/
 */
export const LBrace = createToken({
  name: "LBrace",
  pattern: /\{/,
});

/**
 * Right brace delimiter.
 *
 * Closes attribute refinement groups.
 *
 * @example << 64572001 : { 363698007 = << 39057004 }
 * @pattern /\}/
 */
export const RBrace = createToken({
  name: "RBrace",
  pattern: /\}/,
});

/**
 * Left bracket delimiter.
 *
 * Opens cardinality constraints or attribute sets.
 *
 * @example << 404684003 : [1..3] 363698007 = << 39057004
 * @pattern /\[/
 */
export const LBracket = createToken({
  name: "LBracket",
  pattern: /\[/,
});

/**
 * Right bracket delimiter.
 *
 * Closes cardinality constraints or attribute sets.
 *
 * @example << 404684003 : [1..3] 363698007 = << 39057004
 * @pattern /\]/
 */
export const RBracket = createToken({
  name: "RBracket",
  pattern: /\]/,
});

/**
 * Colon delimiter.
 *
 * Separates focus concepts from attribute refinements.
 *
 * @example << 404684003 : 363698007 = << 39057004
 * @pattern /:/
 */
export const Colon = createToken({
  name: "Colon",
  pattern: /:/,
});

/**
 * Comma delimiter.
 *
 * Separates multiple attributes in a refinement or items in a list.
 *
 * @example << 19829001 : 363698007 = << 39057004, 116676008 = << 72704001
 * @pattern /,/
 */
export const Comma = createToken({
  name: "Comma",
  pattern: /,/,
});

/**
 * Hash delimiter.
 *
 * Prefixes cardinality constraints in attribute refinements.
 *
 * @example << 404684003 : #363698007 = << 39057004
 * @pattern /#/
 */
export const Hash = createToken({
  name: "Hash",
  pattern: /#/,
});

/**
 * Double-dot range operator.
 *
 * Specifies numeric ranges in cardinality constraints. Must be defined before single Dot.
 *
 * @example [1..3]
 * @example [0..*]
 * @pattern /\.\./
 */
export const DotDot = createToken({
  name: "DotDot",
  pattern: /\.\./,
});

/**
 * Dot delimiter.
 *
 * Used in attribute name paths for reverse attribute navigation.
 *
 * @example << 404684003 : 246075003.116676008 = << 72704001
 * @pattern /\./
 */
export const Dot = createToken({
  name: "Dot",
  pattern: /\./,
});

/**
 * Pipe delimiter.
 *
 * Delimits human-readable term strings after concept IDs.
 *
 * @example 404684003 |Clinical finding|
 * @pattern /\|/
 */
export const Pipe = createToken({
  name: "Pipe",
  pattern: /\|/,
});

/**
 * SNOMED CT concept identifier (SCTID).
 *
 * Matches valid SNOMED CT identifiers consisting of 6 to 18 digits. Must be defined
 * before Integer to match longer patterns first.
 *
 * @example 404684003
 * @example 138875005 |SNOMED CT Concept|
 * @pattern /\d{6,18}/
 */
export const SctId = createToken({
  name: "SctId",
  pattern: /\d{6,18}/,
});

/**
 * Integer literal.
 *
 * Matches numeric values used in cardinality constraints, filter values, and other
 * contexts. Catches any remaining digit sequences not matched by SctId.
 *
 * @example [1..3]
 * @example [0..*]
 * @pattern /\d+/
 */
export const Integer = createToken({
  name: "Integer",
  pattern: /\d+/,
});

/**
 * String literal (double-quoted).
 *
 * Matches quoted strings with support for escaped characters. Used in filter
 * expressions for term values, dates, and other string data.
 *
 * @example {{ term = "heart attack" }}
 * @example {{ effectiveTime = "20190731" }}
 * @pattern /"([^"\\]|\\.)&#42;"/
 */
export const StringLiteral = createToken({
  name: "StringLiteral",
  pattern: /"([^"\\]|\\.)*"/,
});

/**
 * Term string (pipe-delimited).
 *
 * Captures human-readable term descriptions between pipe characters. Must be defined
 * before Pipe token to match the complete |term| pattern.
 *
 * @example |Clinical finding|
 * @example |Pulmonary emphysema (disorder)|
 * @pattern /\|[^|]&#42;\|/
 */
export const TermString = createToken({
  name: "TermString",
  pattern: /\|[^|]*\|/,
});

/**
 * Dialect alias identifier.
 *
 * Matches language-region codes in ISO format (two lowercase letters, hyphen, two uppercase
 * letters). Used in dialect filters. Must be defined before Identifier to match first.
 *
 * @example {{ language = en }}
 * @example {{ dialect = en-US (PREFERRED) }}
 * @pattern /[a-z]{2}-[A-Z]{2}/
 */
export const DialectAlias = createToken({
  name: "DialectAlias",
  pattern: /[a-z]{2}-[A-Z]{2}/,
});

/**
 * Alternate identifier code.
 *
 * Matches external code system identifiers that start with digits and contain hyphens
 * (e.g., LOINC codes). Must start with digits to distinguish from scheme names.
 *
 * @example id(LOINC 54486-6)
 * @example id(ICD-10 E11.9)
 * @pattern /\d+(?:-[a-zA-Z0-9]+)+/
 */
export const AlternateIdCode = createToken({
  name: "AlternateIdCode",
  pattern: /\d+(?:-[a-zA-Z0-9]+)+/,
});

/**
 * Decimal number literal.
 *
 * Matches decimal values with optional sign prefix. Used in numeric concrete
 * domain values. Must be defined before Integer to match decimal patterns first.
 *
 * Uses negative lookahead to prevent matching dotted SCTID paths (e.g.,
 * "929360061000036106.127489000") as decimal values. The lookahead ensures
 * the decimal portion has fewer than 6 digits (SCTIDs are 6-18 digits).
 *
 * @example #12.5
 * @example #-10.25
 * @example #+3.14
 * @pattern /[+-]?\d+\.(?!\d{6})\d+/
 */
export const DecimalValue = createToken({
  name: "DecimalValue",
  pattern: /[+-]?\d+\.(?!\d{6})\d+/,
});

/**
 * Signed integer literal.
 *
 * Matches integer values with required sign prefix. Used in numeric concrete
 * domain values to distinguish from unsigned integers and SNOMED CT identifiers.
 * Must be defined before unsigned Integer to match signed patterns first.
 *
 * @example #-10
 * @example #+42
 * @pattern /[+-]\d+/
 */
export const SignedInteger = createToken({
  name: "SignedInteger",
  pattern: /[+-]\d+/,
});

/**
 * Generic identifier token.
 *
 * Matches alphanumeric identifiers starting with a letter. Used for code system
 * scheme names in alternate identifiers and other named elements. Defined last
 * as a catch-all for any remaining alphabetic tokens not matched by keywords.
 *
 * @example id(LOINC 54486-6) - "LOINC" is an Identifier
 * @example {{ language = en }} - "en" is an Identifier
 * @pattern /[a-zA-Z][a-zA-Z0-9_]&#42;/
 */
export const Identifier = createToken({
  name: "Identifier",
  pattern: /[a-zA-Z][a-zA-Z0-9_]*/,
});

/**
 * Complete token vocabulary for the ECL lexer in precedence order.
 *
 * Token ordering is CRITICAL for correct lexical analysis. Chevrotain's lexer uses
 * two key principles: longest-match-wins and first-match-wins. When multiple patterns
 * could match at the current position, Chevrotain tries patterns in array order and
 * selects the first successful match.
 *
 * Four essential ordering rules:
 *
 * 1. **Longer patterns before shorter prefixes**: Multi-character operators like <<, <<!,
 *    >>, >>! must precede their single-character prefixes (<, >). Otherwise, << would be
 *    incorrectly lexed as two < tokens.
 *    Example: DescendantOrSelfOf (<<) before DescendantOf (<)
 *
 * 2. **Longer keywords before shorter substrings**: Keywords that contain other keywords
 *    as substrings must appear first. For instance, "descendantOrSelfOf" must precede
 *    "descendantOf" to prevent partial matching.
 *    Example: DescendantOrSelfOfKeyword before DescendantOfKeyword
 *
 * 3. **Specific patterns before general patterns**: More specific tokens (like SctId with
 *    6-18 digits) must precede more general patterns (like Integer matching any digits).
 *    Otherwise, "404684003" would match Integer instead of SctId.
 *    Example: SctId (/\d{6,18}/) before Integer (/\d+/)
 *
 * 4. **Keywords before identifiers**: All keyword tokens (And, Or, True, False, etc.) must
 *    be defined before the generic Identifier token, which acts as a catch-all for any
 *    alphabetic sequences. Otherwise, "AND" would be lexed as an Identifier.
 *    Example: And, Or, Minus before Identifier
 *
 * Critical orderings with rationale:
 * - DoubleLBrace ({{) before LBrace ({): Prevents {{ from becoming two { tokens
 * - DotDot (..) before Dot (.): Range operator must be recognized as single token
 * - TermString (|...|) before Pipe (|): Complete term must match before delimiter
 * - AlternateIdCode before SctId: Hyphenated codes (54486-6) vs plain numeric IDs
 * - NotEquals (!=) before comparison ops: Prevents != from becoming ! followed by =
 * - Comparison ops (<=, >=) before DescendantOf/AncestorOf (<, >): Disambiguates dual use
 *
 * @see https://chevrotain.io/docs/guide/resolving_lexer_errors.html#UNREACHABLE
 */
export const allTokens = [
  // Whitespace and comments first
  WhiteSpace,
  BlockComment,

  // Double braces before single braces
  DoubleLBrace,
  DoubleRBrace,

  // Multi-char constraint operators (longest first)
  ChildOrSelfOf,      // <<!
  DescendantOrSelfOf, // <<
  ChildOf,            // <!
  ParentOrSelfOf,     // >>!
  AncestorOrSelfOf,   // >>
  ParentOf,           // >!

  // Comparison operators (longest first)
  NotEquals,          // !=
  LessThanOrEquals,   // <=
  GreaterThanOrEquals, // >=
  Equals,             // =

  // Single char constraint operators
  DescendantOf,       // <
  AncestorOf,         // >
  MemberOf,           // ^
  Wildcard,           // *

  // Logical operators
  And,
  Or,
  Minus,

  // Long-form constraint keywords (longer first)
  DescendantOrSelfOfKeyword,
  DescendantOfKeyword,
  ChildOrSelfOfKeyword,
  ChildOfKeyword,
  AncestorOrSelfOfKeyword,
  AncestorOfKeyword,
  ParentOrSelfOfKeyword,
  ParentOfKeyword,
  MemberOfKeyword,
  ReverseOf,

  // Filter keywords
  DefinitionStatusId,
  EffectiveTime,
  ModuleId,
  TypeKeyword,
  Language,
  Dialect,
  Term,
  Active,
  Match,
  Wild,
  Preferred,
  Acceptable,
  Primitive,
  Defined,
  True,
  False,

  // Delimiters
  LParen,
  RParen,
  LBrace,
  RBrace,
  LBracket,
  RBracket,
  Colon,
  Comma,
  Hash,
  DotDot,
  Dot,

  // Term string (pipes with content) - must come before Pipe
  TermString,
  Pipe,

  // Alternate ID codes with hyphens (before SCTID/Integer to get priority)
  AlternateIdCode,

  // Numeric literals (most specific first: decimal > signed > unsigned)
  DecimalValue,      // Must be first (matches sign + digits + dot + digits)
  SignedInteger,     // Then signed integers (matches sign + digits)

  // SCTID before Integer (longer pattern)
  SctId,
  Integer,

  // String literal
  StringLiteral,

  // Dialect alias before identifier
  DialectAlias,

  // Identifier last (catch-all for names)
  Identifier,
];

/**
 * ECL lexer instance configured with all token definitions.
 *
 * This Chevrotain lexer transforms ECL source text into a token stream for parsing.
 * Automatically handles whitespace skipping and comment filtering based on token configurations.
 */
export const EclLexer = new Lexer(allTokens);

/**
 * Tokenizes ECL source text into a token stream.
 *
 * Converts raw ECL expression text into an array of tokens with position information.
 * This is the entry point for lexical analysis in the ECL parser pipeline.
 *
 * @param text - ECL source text to tokenize
 * @returns Lexing result containing token array and any lexing errors
 *
 * @example
 * const result = tokenize("<< 404684003 |Clinical finding|");
 * console.log(result.tokens); // Array of token objects
 * console.log(result.errors); // Array of lexing errors (if any)
 */
export function tokenize(text: string) {
  return EclLexer.tokenize(text);
}
