# ECL Formatting Rules

This document describes the formatting behavior of the ECL formatter.

## General Principles

- **Simple expressions** stay on a single line
- **Complex expressions** break across multiple lines
- **No lonely operators** - operators stay with their operands
- **Aligned parentheses** - opening `(` and closing `)` are vertically aligned

## Complexity Detection

An expression is considered **complex** if it contains any of:
- Refinements (expressions with `:`)
- Nested expressions (parentheses)
- Filters (`{{ ... }}`)
- Multiple attributes or attribute groups

Simple expressions like `< 404684003 OR << 987654321` remain inline.

## Parenthesis Alignment

Opening and closing parentheses are **always vertically aligned**:

```ecl
(
  content
)
```

For nested parentheses, each pair aligns:

```ecl
(
  < 440130005: << 127489000 = (
                                 << 418681006 OR < 372650007
                               )
)
```

## Compound Expressions (AND, OR, MINUS)

### Simple Chains (Inline)

Simple concept references stay on one line:

```ecl
< 411317002 OR < 420116007 OR 765191000168109
```

### Complex Operands (Multi-line)

When operands are complex, break with operator on same line as right operand:

```ecl
< 411317002
OR < 420116007
OR 765191000168109
```

### Nested Expressions

When an operator is followed by a nested expression, keep them together:

```ecl
< 411317002
OR(
    << 19829001 AND << 301867009
  )
```

Note: Opening `(` stays with operator, content on next line, closing `)` aligns with `(`.

## Refinements

### Simple Refinement (Inline)

```ecl
<< 404684003: 363698007 = << 39057004
```

### Multiple Attributes (Multi-line)

```ecl
<< 404684003:
  363698007 = << 39057004,
  116676008 = << 55641003
```

### Attribute Groups (Multi-line)

```ecl
<< 404684003: {
  363698007 = << 39057004,
  116676008 = << 55641003
}
```

## Nested Expressions

### Simple Content (Inline)

Nested expressions with non-complex content stay on one line:

```ecl
(^ 929360031000036100 {{ term = "sunscreen" }})
```

### Complex Content (Multi-line)

Nested expressions with complex content break across lines:

```ecl
(
  < 440130005: << 127489000 = (
                                 << 418681006 OR < 372650007
                               )
)
```

## Indentation

- Default indent size: **2 spaces**
- Configurable via `ecl.formatter.indentSize` setting
- Each nested level adds one indent
- Content inside parentheses aligns based on:
  - Standard indentation when `(` is at start of line
  - Column alignment when `(` is mid-line

**Note:** Tab characters are not supported for indentation. ECL expressions are intended to be rendered with monospaced fonts, and tabs would introduce width inconsistencies that impose unnecessary style costs. Only space characters are used.

## Filters

Filters stay with their expression:

```ecl
<< 404684003 {{ term = "heart" }}
```

Multiple filter constraints:

```ecl
<< 404684003 {{ term = "heart", dialect = en-US }}
```

## Reverse Attributes

Reverse attributes allow navigation of relationships in reverse direction using either the brief `R` syntax or the long `reverseOf` keyword.

### Brief Syntax

```ecl
< 91723000 : R 363698007 = < 125605004
```

### Long Syntax

The `reverseOf` keyword is normalized to the brief `R` form:

```ecl
// Input
< 91723000 : reverseOf 363698007 = < 125605004

// Output
< 91723000 : R 363698007 = < 125605004
```

### With Cardinality

```ecl
<< 404684003: [1..*] R 363698007 = << 39057004
```

### Multiple Reverse Attributes

```ecl
<< 404684003:
  R 363698007 = << 39057004,
  R 116676008 = << 55641003
```

## Dotted Attributes

Dotted attribute notation allows chained attribute navigation. Each component is separated by dots with spaces: ` . `

### Simple Dotted Path

```ecl
< 125605004 . 363698007
```

### Chained Dotted Attributes

```ecl
<< 19829001 . < 47429007 . 363698007
```

### With Constraint Operators

```ecl
< 125605004 . << 363698007
```

### Nested with Parentheses

```ecl
((< 19829001) . < 47429007) . 363698007
```
