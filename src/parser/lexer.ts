import { createToken, Lexer, ITokenConfig } from "chevrotain";

// Whitespace - skipped
export const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

// Comments - preserved for formatting
export const BlockComment = createToken({
  name: "BlockComment",
  pattern: /\/\*[\s\S]*?\*\//,
});

// Double brace delimiters (must come before single braces)
export const DoubleLBrace = createToken({
  name: "DoubleLBrace",
  pattern: /\{\{/,
});

export const DoubleRBrace = createToken({
  name: "DoubleRBrace",
  pattern: /\}\}/,
});

// Constraint operators - brief syntax (order by length, longest first)
export const ChildOrSelfOf = createToken({
  name: "ChildOrSelfOf",
  pattern: /<<!/,
});

export const DescendantOrSelfOf = createToken({
  name: "DescendantOrSelfOf",
  pattern: /<</,
});

export const ChildOf = createToken({
  name: "ChildOf",
  pattern: /<!/,
});

export const ParentOrSelfOf = createToken({
  name: "ParentOrSelfOf",
  pattern: />>!/,
});

export const AncestorOrSelfOf = createToken({
  name: "AncestorOrSelfOf",
  pattern: />>/,
});

export const ParentOf = createToken({
  name: "ParentOf",
  pattern: />!/,
});

export const MemberOf = createToken({
  name: "MemberOf",
  pattern: /\^/,
});

// Comparison operators (order by length)
export const NotEquals = createToken({
  name: "NotEquals",
  pattern: /!=/,
});

export const LessThanOrEquals = createToken({
  name: "LessThanOrEquals",
  pattern: /<=/,
});

export const GreaterThanOrEquals = createToken({
  name: "GreaterThanOrEquals",
  pattern: />=/,
});

export const Equals = createToken({
  name: "Equals",
  pattern: /=/,
});

// Single char constraint operators (must come after multi-char versions)
export const DescendantOf = createToken({
  name: "DescendantOf",
  pattern: /</,
});

export const AncestorOf = createToken({
  name: "AncestorOf",
  pattern: />/,
});

export const Wildcard = createToken({
  name: "Wildcard",
  pattern: /\*/,
});

// Logical operators (keywords)
export const And = createToken({
  name: "And",
  pattern: /AND/,
});

export const Or = createToken({
  name: "Or",
  pattern: /OR/,
});

export const Minus = createToken({
  name: "Minus",
  pattern: /MINUS/,
});

// Constraint operator keywords (long form)
export const DescendantOfKeyword = createToken({
  name: "DescendantOfKeyword",
  pattern: /descendantOf/,
});

export const DescendantOrSelfOfKeyword = createToken({
  name: "DescendantOrSelfOfKeyword",
  pattern: /descendantOrSelfOf/,
});

export const ChildOfKeyword = createToken({
  name: "ChildOfKeyword",
  pattern: /childOf/,
});

export const ChildOrSelfOfKeyword = createToken({
  name: "ChildOrSelfOfKeyword",
  pattern: /childOrSelfOf/,
});

export const AncestorOfKeyword = createToken({
  name: "AncestorOfKeyword",
  pattern: /ancestorOf/,
});

export const AncestorOrSelfOfKeyword = createToken({
  name: "AncestorOrSelfOfKeyword",
  pattern: /ancestorOrSelfOf/,
});

export const ParentOfKeyword = createToken({
  name: "ParentOfKeyword",
  pattern: /parentOf/,
});

export const ParentOrSelfOfKeyword = createToken({
  name: "ParentOrSelfOfKeyword",
  pattern: /parentOrSelfOf/,
});

export const MemberOfKeyword = createToken({
  name: "MemberOfKeyword",
  pattern: /memberOf/,
});

// Filter keywords
export const Term = createToken({
  name: "TermKeyword",
  pattern: /term/,
});

export const Language = createToken({
  name: "Language",
  pattern: /language/,
});

export const TypeKeyword = createToken({
  name: "TypeKeyword",
  pattern: /typeId|type/,
});

export const Dialect = createToken({
  name: "Dialect",
  pattern: /dialectId|dialect/,
});

export const ModuleId = createToken({
  name: "ModuleId",
  pattern: /moduleId/,
});

export const EffectiveTime = createToken({
  name: "EffectiveTime",
  pattern: /effectiveTime/,
});

export const Active = createToken({
  name: "Active",
  pattern: /active/,
});

export const DefinitionStatusId = createToken({
  name: "DefinitionStatusId",
  pattern: /definitionStatusId/,
});

export const Preferred = createToken({
  name: "Preferred",
  pattern: /PREFERRED/,
});

export const Acceptable = createToken({
  name: "Acceptable",
  pattern: /ACCEPTABLE/,
});

export const Primitive = createToken({
  name: "Primitive",
  pattern: /PRIMITIVE/,
});

export const Defined = createToken({
  name: "Defined",
  pattern: /DEFINED/,
});

export const Match = createToken({
  name: "Match",
  pattern: /match/,
});

export const Wild = createToken({
  name: "Wild",
  pattern: /wild/,
});

// Boolean literals
export const True = createToken({
  name: "True",
  pattern: /true/,
});

export const False = createToken({
  name: "False",
  pattern: /false/,
});

// Delimiters
export const LParen = createToken({
  name: "LParen",
  pattern: /\(/,
});

export const RParen = createToken({
  name: "RParen",
  pattern: /\)/,
});

export const LBrace = createToken({
  name: "LBrace",
  pattern: /\{/,
});

export const RBrace = createToken({
  name: "RBrace",
  pattern: /\}/,
});

export const LBracket = createToken({
  name: "LBracket",
  pattern: /\[/,
});

export const RBracket = createToken({
  name: "RBracket",
  pattern: /\]/,
});

export const Colon = createToken({
  name: "Colon",
  pattern: /:/,
});

export const Comma = createToken({
  name: "Comma",
  pattern: /,/,
});

export const Hash = createToken({
  name: "Hash",
  pattern: /#/,
});

export const DotDot = createToken({
  name: "DotDot",
  pattern: /\.\./,
});

export const Dot = createToken({
  name: "Dot",
  pattern: /\./,
});

export const Pipe = createToken({
  name: "Pipe",
  pattern: /\|/,
});

// SNOMED CT ID (6-18 digits)
export const SctId = createToken({
  name: "SctId",
  pattern: /\d{6,18}/,
});

// Integer (1-5 digits, for cardinality etc.)
export const Integer = createToken({
  name: "Integer",
  pattern: /\d+/,
});

// String literal
export const StringLiteral = createToken({
  name: "StringLiteral",
  pattern: /"([^"\\]|\\.)*"/,
});

// Term string (between pipes) - handled specially in parser
// We'll capture the content between pipes as a TermString
export const TermString = createToken({
  name: "TermString",
  pattern: /\|[^|]*\|/,
});

// Dialect alias (e.g., en-US, en-GB)
export const DialectAlias = createToken({
  name: "DialectAlias",
  pattern: /[a-z]{2}-[A-Z]{2}/,
});

// Identifier (for scheme names in alternate identifiers)
export const Identifier = createToken({
  name: "Identifier",
  pattern: /[a-zA-Z][a-zA-Z0-9_]*/,
});

// All tokens in order (precedence matters - longer/more specific patterns first)
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

// Create the lexer
export const EclLexer = new Lexer(allTokens);

// Helper function to tokenize ECL
export function tokenize(text: string) {
  return EclLexer.tokenize(text);
}
