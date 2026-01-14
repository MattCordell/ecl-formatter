# SNOMED CT ECL Formatter

A Visual Studio Code extension that provides syntax highlighting and document formatting for SNOMED CT Expression Constraint Language (ECL).

## Features

- **Syntax Highlighting**: Full TextMate grammar for ECL syntax
- **Document Formatting**: Intelligent formatting with complexity-aware line breaking
- **Range Formatting**: Format selected text regions
- **Idempotent**: Formatting the same text multiple times produces identical results

## Web Formatter

Try the online ECL formatter: https://mattcordell.github.io/ecl-formatter/

Format ECL expressions directly in your browser without installing the extension. The web version uses the same formatting logic as the VS Code extension, ensuring consistent results.

**Features:**
- Format ECL expressions online
- Copy formatted output to clipboard
- Example expressions included
- Mobile-friendly responsive design
- Works in all modern browsers

## Installation

### From VSIX
1. Download the `.vsix` file from releases
2. In VS Code: Extensions → ... → Install from VSIX
3. Select the downloaded file

### From Source
```bash
git clone https://github.com/MattCordell/ecl-formatter.git
cd ecl-formatter
npm install
npm run build
```

Press F5 to launch Extension Development Host for testing.

## Usage

### File Extensions
The extension activates for files with extensions:
- `.ecl`
- `.snomed-ecl`

### Format Document
- **Command**: Format Document
- **Keyboard**: Shift+Alt+F (Windows/Linux) or Shift+Option+F (macOS)
- **Command Palette**: "Format Document"

### Format Selection
- Select text
- **Command**: Format Selection
- **Command Palette**: "Format Selection"

### Configuration
```json
{
  "ecl.formatter.indentSize": 2  // Number of spaces per indent level
}
```

## ECL Syntax Overview

SNOMED CT Expression Constraint Language (ECL) is a formal language for defining constraints on SNOMED CT concepts.

**Examples:**
```ecl
// Simple concept reference
404684003 |Clinical finding|

// Descendant constraint
<< 404684003

// Refinement
<< 404684003: 363698007 = << 39057004

// Compound expression
<< 404684003 AND << 987654321

// With filters
<< 404684003 {{ term = "heart" }}
```

## Architecture

- **src/extension.ts** - VS Code extension entry point
- **src/parser/** - Chevrotain-based lexer and parser
  - `lexer.ts` - Token definitions
  - `parser.ts` - Grammar rules (CST)
  - `ast.ts` - AST node type definitions
  - `visitor.ts` - CST to AST transformation
- **src/formatter/** - Document formatting
  - `format.ts` - Pure formatting function
  - `formatter.ts` - VS Code providers
  - `printer.ts` - AST to formatted text
  - `rules.ts` - Formatting logic and complexity detection
- **syntaxes/** - TextMate grammar for syntax highlighting
- **src/test/** - Test suite (vitest)

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our documentation standards, code style, and development process.

## Resources

- [ECL Specification](https://docs.snomed.org/snomed-ct-specifications/snomed-ct-expression-constraint-language)
- [ECL ANTLR Grammar](https://github.com/IHTSDO/snomed-expression-constraint-language)
- [SNOMED International](https://www.snomed.org/)

## License

[License information to be added]

## Acknowledgments

Built with [Chevrotain](https://chevrotain.io/) parser framework.
