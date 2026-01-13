# Contributing to ECL Formatter

Thank you for your interest in contributing to the SNOMED CT ECL Formatter! This document provides guidelines for contributing to the project.

## Documentation Standards

### Parser and Lexer Documentation
When modifying parser grammar rules or lexer tokens, maintain JSDoc comments:

**For Lexer Tokens:**
- Include description of what the token matches
- Provide usage context (where it appears in ECL syntax)
- Include 2-3 realistic examples
- Document the regex pattern purpose if complex

Example:
```typescript
/**
 * Descendant-or-self-of constraint operator (brief syntax).
 *
 * Matches concepts that are descendants of OR equal to the specified concept
 * in the SNOMED CT hierarchy.
 *
 * @example
 * - << 404684003 |Clinical finding|
 * - << *
 *
 * @pattern /<<(?!!)/
 * @see DescendantOrSelfOfKeyword for long-form syntax
 */
export const DescendantOrSelfOf = createToken({
  name: "DescendantOrSelfOf",
  pattern: /<<(?!!)/,
});
```

**For Parser Rules:**
- Document the grammar rule being implemented
- Explain the purpose and context
- Provide 2-3 example ECL expressions that match the rule
- Note any special handling or edge cases

Example:
```typescript
/**
 * Parses refinement syntax: attribute constraints on a concept.
 *
 * Refinements specify attribute-value pairs that must be true for matching
 * concepts. Can include multiple attributes separated by commas or conjunctions,
 * and can be organized into attribute groups using braces.
 *
 * @grammar ":" (attributeSet | attributeGroup) (("," | conjunction) (attributeSet | attributeGroup))*
 *
 * @example
 * - : 363698007 = << 39057004
 * - : 363698007 = << 39057004, 116676008 = << 55641003
 * - : { 363698007 = << 39057004 }
 */
private eclRefinement = this.RULE("eclRefinement", () => {
```

**For Public API Functions:**
- Include detailed @param and @returns documentation
- Provide realistic usage examples
- Document error conditions
- Link to relevant ECL specification sections

**Token Ordering:**
If adding or modifying tokens in lexer.ts:
- Maintain the documented ordering rules
- Place longer patterns before shorter overlapping patterns (e.g., `<<` before `<`)
- Update the allTokens JSDoc if ordering strategy changes

The token ordering is critical because Chevrotain uses a longest-match strategy, but when patterns overlap, the first matching token wins.

### Code Standards

- **TypeScript**: Use TypeScript strict mode
- **Testing**: Maintain test coverage for new features
- **Test Before Commit**: Always run `npm test` before committing
- **Formatting**: Code should be consistently formatted (Prettier if configured)
- **No Unused Code**: Remove unused imports, variables, and functions

### Commit Messages

Follow conventional commits format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `refactor:` for code refactoring
- `test:` for test additions/changes
- `chore:` for build process or auxiliary tool changes

Examples:
```
feat: add support for wildcard expressions in filters
fix: correct token ordering for multi-char operators
docs: add JSDoc to all lexer tokens
refactor: extract duplicate conjunction formatting logic
test: add idempotency tests for formatter
```

### Pull Request Process

1. **Create a branch**: Create a feature branch from `main`
2. **Make changes**: Implement your changes following the guidelines above
3. **Test**: Ensure all tests pass with `npm test`
4. **Build**: Verify TypeScript compiles with `npm run build`
5. **Update documentation**:
   - Update JSDoc if changing public APIs or parser internals
   - Update README if adding features
6. **Add tests**: Include tests for new functionality
7. **Commit**: Use conventional commit messages
8. **Push**: Push your branch and create a pull request
9. **Reference issues**: Link related issues in the PR description

### Development Workflow

```bash
# Clone and setup
git clone https://github.com/MattCordell/ecl-formatter.git
cd ecl-formatter
npm install

# Development
npm run watch  # Build and watch for changes

# Testing
npm test       # Run test suite
npm run build  # Build for production

# VS Code Extension Testing
# Press F5 to launch Extension Development Host
```

### Project Structure

- **src/extension.ts** - VS Code extension activation
- **src/parser/** - Chevrotain-based parser
  - `lexer.ts` - Token definitions (50+ tokens)
  - `parser.ts` - Grammar rules (26+ rules)
  - `ast.ts` - AST type definitions
  - `visitor.ts` - CST to AST transformation
- **src/formatter/** - Formatting logic
  - `format.ts` - Pure formatting function
  - `printer.ts` - AST to text conversion
  - `rules.ts` - Complexity and line-breaking rules
- **src/test/** - Test suite (vitest)

## Getting Help

- **Issues**: Check [existing issues](https://github.com/MattCordell/ecl-formatter/issues) before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **ECL Specification**: Refer to the [official ECL specification](https://docs.snomed.org/snomed-ct-specifications/snomed-ct-expression-constraint-language)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
