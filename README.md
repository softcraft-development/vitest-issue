# Vitest Module Issue

Demonstrates that Vitest 1.6 cannot work as Typescript Node project without a bundler.

## Problem

Using Vitest in a TypeScript project using Node modules results in an error due to way Vitest structures its files. See below for additional details.

### Node Modules

The command `npm run node16` runs `tsc` using `"moduleResolution": "Node16", "module": "Node16"` (via `tsconfig.node16.json`).
These are typical Typescript configurations when building and running a Node application or library.

This results in the following output:

```
% npm run node16

> vitest-issue@1.0.0 node16
> tsc -p tsconfig.node16.json

node_modules/vitest/index.d.cts:1:15 - error TS1479: The current file is a CommonJS module whose imports will produce 'require' calls; however, the referenced file is an ECMAScript module and cannot be imported with 'require'. Consider writing a dynamic 'import("./dist/index.js")' call instead.

1 export * from './dist/index.js'
                ~~~~~~~~~~~~~~~~~


Found 1 error in node_modules/vitest/index.d.cts:1
```

Inspecting the referenced files shows why the error occurs:
* `node_modules/vitest/package.json` has `.exports.".".require.types` set to `./index.d.cts`.
  * This is to be expected for a CommonJS module.
* Setting `"moduleResolution": "node16"` appears to trigger TypeScript to use the `require` settings in `exports`.
* `node_modules/vitest/index.d.cts` contains only `export * from './dist/index.js'`
* `node_modules/vitest/dist/index.js` then uses `import` and `export`, i.e.: ES Module syntax, not CommonJS syntax.

This is a problem because [`node16` is the recommended setting for creating a library](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html#im-writing-a-library), both for direct execution in Node and for inclusion by bundlers.

### Bundler

So far, the only combination of `tsconfig.json` settings I've found that allows TypeScript to compile successfully is `"module": "Preserve", "moduleResolution": "Bundler"`.

The command `npm run bundler` runs `tsc` using `"moduleResolution": "bundler", "module": "preserve"` (via `tsconfig.bundler.json`). `tsc` then executes without any errors.

This works because:
* `node_modules/vitest/package.json` has `.exports.".".import.types` set to `./dist/index.d.ts`.
  * This is to be expected for a ES Module.
* Setting `"moduleResolution": "bundler"` appears to trigger TypeScript to use the `import` settings in `exports`.
* `node_modules/vitest/dist/index.d.ts` contains all of the types.

However, `"moduleResolution": "bundler"` is [discouraged by the TypeScript documentation when writing Node modules](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html#im-writing-a-library):

> In short, "moduleResolution": "bundler" is infectious, allowing code that only works in bundlers to be produced. Likewise, "moduleResolution": "nodenext" is only checking that the output works in Node.js, but in most cases, module code that works in Node.js will work in other runtimes and in bundlers.