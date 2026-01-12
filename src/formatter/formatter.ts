/**
 * VS Code Document Formatter for ECL
 */

import * as vscode from "vscode";
import { formatEcl } from "./format";
import { defaultOptions, FormattingOptions } from "./rules";

/**
 * VS Code Document Formatting Provider for ECL files
 */
export class EclDocumentFormattingProvider
  implements vscode.DocumentFormattingEditProvider
{
  provideDocumentFormattingEdits(
    document: vscode.TextDocument,
    vsOptions: vscode.FormattingOptions,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.TextEdit[]> {
    // Get configuration
    const config = vscode.workspace.getConfiguration("ecl.formatter");
    const indentSize = config.get<number>("indentSize", defaultOptions.indentSize);

    const options: FormattingOptions = {
      indentSize,
    };

    const text = document.getText();
    const result = formatEcl(text, options);

    if (result.formatted === null) {
      // Parse error - don't modify the document
      // Optionally show error message
      if (result.error) {
        vscode.window.showWarningMessage(`ECL format error: ${result.error}`);
      }
      return [];
    }

    // Replace entire document with formatted text
    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(text.length)
    );

    return [vscode.TextEdit.replace(fullRange, result.formatted)];
  }
}

/**
 * VS Code Document Range Formatting Provider for ECL files
 */
export class EclDocumentRangeFormattingProvider
  implements vscode.DocumentRangeFormattingEditProvider
{
  provideDocumentRangeFormattingEdits(
    document: vscode.TextDocument,
    range: vscode.Range,
    vsOptions: vscode.FormattingOptions,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.TextEdit[]> {
    // Get configuration
    const config = vscode.workspace.getConfiguration("ecl.formatter");
    const indentSize = config.get<number>("indentSize", defaultOptions.indentSize);

    const options: FormattingOptions = {
      indentSize,
    };

    const text = document.getText(range);
    const result = formatEcl(text, options);

    if (result.formatted === null) {
      // Parse error - don't modify the selection
      return [];
    }

    return [vscode.TextEdit.replace(range, result.formatted)];
  }
}
