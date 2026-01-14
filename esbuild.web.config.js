const esbuild = require("esbuild");

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ["src/web/browser-entry.ts"],
    bundle: true,
    format: "iife",              // Browser-compatible format
    globalName: "EclFormatter",  // window.EclFormatter
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: "browser",         // Browser target
    target: "es2020",
    outfile: "docs/ecl-formatter.js",
    logLevel: "info",
    // Bundle Chevrotain (no external dependencies)
  });

  if (watch) {
    await ctx.watch();
    console.log("Watching for changes...");
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
