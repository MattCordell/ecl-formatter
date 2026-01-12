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
