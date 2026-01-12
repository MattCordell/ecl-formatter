import * as vscode from "vscode";
import {
  EclDocumentFormattingProvider,
  EclDocumentRangeFormattingProvider,
} from "./formatter";

export function activate(context: vscode.ExtensionContext) {
  console.log("ECL Formatter extension activated");

  // Register document formatter
  const documentFormatter = new EclDocumentFormattingProvider();
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(
      { language: "ecl", scheme: "file" },
      documentFormatter
    )
  );

  // Register range formatter for format selection
  const rangeFormatter = new EclDocumentRangeFormattingProvider();
  context.subscriptions.push(
    vscode.languages.registerDocumentRangeFormattingEditProvider(
      { language: "ecl", scheme: "file" },
      rangeFormatter
    )
  );
}

export function deactivate() {
  // Cleanup if needed
}
