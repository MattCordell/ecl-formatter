/**
 * Browser bundle entry point for ECL Formatter
 *
 * This module exports the core formatting API for use in browser environments.
 * It excludes VS Code-specific dependencies and provides a clean API surface.
 */

import { formatEcl } from "../formatter/format";
import { defaultOptions, FormattingOptions } from "../formatter/rules";

// Expose clean API to window object
export { formatEcl, defaultOptions };
export type { FormattingOptions };
