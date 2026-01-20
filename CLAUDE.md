# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VS Code extension for formatting and syntax highlighting SNOMED CT Expression Constraint Language (ECL) expressions.

## Build Commands

```bash
npm install        # Install dependencies
npm run build      # Build the extension
npm run watch      # Build and watch for changes
npm test           # Run tests
npm run package    # Package as .vsix
```

## Development

Press F5 in VS Code to launch the Extension Development Host for testing.

## Architecture

- **src/extension.ts** - Extension entry point, registers formatters
- **src/parser/** - Chevrotain-based ECL lexer and parser
  - `lexer.ts` - Token definitions
  - `parser.ts` - Grammar rules (CST)
  - `ast.ts` - AST node types
  - `visitor.ts` - CST to AST transformation
- **src/formatter/** - Document formatting
  - `formatter.ts` - VS Code DocumentFormattingEditProvider
  - `printer.ts` - AST pretty-printer
  - `rules.ts` - Formatting rules and complexity detection
- **syntaxes/ecl.tmLanguage.json** - TextMate grammar for syntax highlighting
- **language-configuration.json** - Bracket matching, comments, auto-closing

## ECL Reference

- Specification: https://docs.snomed.org/snomed-ct-specifications/snomed-ct-expression-constraint-language
- ANTLR Grammar: https://github.com/IHTSDO/snomed-expression-constraint-language

## Development Workflow

**Testing Requirements:**
- Always add tests when implementing new functionality
- Cover edge cases and different scenarios
- **Never modify existing tests without explicit permission** - ask first to ensure behavior is as expected

**Web App Deployment Workflow:**
- After completing work, rebuild the web app BEFORE committing: `npm run build:web`
- This allows for user acceptance testing of changes in the web interface
- Commit and push the updated `docs/ecl-formatter.js` along with code changes
- The webform uses `docs/ecl-formatter.js`, while the VS Code extension uses `dist/extension.js`
- Routine web app rebuilds do not need to be mentioned in commit messages

**Commit Message Guidelines:**
- Focus commit messages on functional changes (features, fixes, refactoring)
- Do NOT include details about BASH permission or Claude settings updates unless specifically requested
- Do NOT mention routine web app rebuilds in commit messages

## Contributing

When making changes to this codebase, please follow the guidelines in [CONTRIBUTING.md](./CONTRIBUTING.md).

**Key documentation requirements:**
- Parser rules must have JSDoc explaining grammar and examples
- Lexer tokens must have JSDoc explaining pattern and usage
- Public API functions must have JSDoc with examples and parameter docs
- Maintain token ordering rules in lexer.ts (longest-match first)
