# Name resolution: TypeScript, JavaScript, Vue and Angular templates

Follows the ECMAScript module semantics, the TypeScript handbook on modules, module resolution, namespaces and
declaration merging, Node's CommonJS modules, the Vue single-file component compiler and the Angular template
compiler. The four share one name scope (shared rule 1 in [README.md](README.md)): a TypeScript file can import a
JavaScript file or a Vue component and the other way round, by the same rules.

## Declarations

- A module is a `.ts`, `.tsx`, `.mts`, `.cts`, `.js`, `.jsx`, `.mjs`, `.cjs` or `.vue` file; its logical path is its
  file path below the analysis root without the last ending: `src/app/user.service.ts` is `src.app.user.service` (the
  dots of a file name stay inside its segment), `types/globals.d.ts` is `types.globals.d`.
- A class, interface, type alias, enum, function, namespace or variable (each name a `const`, `let` or `var` binds,
  also by destructuring) declared at the top level of a module has the module's path plus its name, whether it is
  exported or not: `src.app.user.service.UserService`.
- A declaration that a `namespace` (or `module`) block exports has the path of the namespace plus its name,
  `src.geo.Shapes.Circle`, and only its own uses are its dependencies (decision 7). What a namespace does not export,
  and every member of a class (method, property, accessor), belongs to the namespace or class around it. A
  declaration inside a function or block is no target: no other declaration can name it.
- The default export: `export default class Base` or `export default function load` is the declaration under its own
  name; an anonymous one (`export default function () {}`, `export default { … }`, `export default defineConfig(…)`)
  is a declaration `default`; `export default name` is the declaration `name` (decision 2). In CommonJS,
  `module.exports = X` (and TypeScript `export = X`) is the default export.
- Code at the top level outside every declaration (`bootstrap(AppModule)`, `app.use(router)`, a statement of a
  polyfill) is one declaration of the kind script, named after the file without its ending plus `.script`
  (`main.script`, in the map `main_script` as every dot of a leaf name, like the script leaves of SQL), that uses
  what this code names; imports and exports are no such code, except a side-effect import (decision 3).
- A re-export makes a declaration of the re-exporting file, of the kind re-export, named by the name it exports, that
  depends on what it re-exports (decision 8):
  - `export { A } from './m'`, `export { A as B } from './m'`, `export { default as B } from './m'`, and an imported
    name that the file exports again (`import { A } from './m'; export { A }`);
  - `export * from './m'`: one declaration per name `m` exports, without its default export and without a name the
    file declares or exports itself; a name two `export *` both offer is exported by neither (TypeScript drops the
    ambiguous name).

  `export { A as B }` without `from` names a declaration of the own file: `B` means `A`, no declaration of its own.
- A declaration of a script file (a file without any `import`, `export`, `require`, `module.exports` or `exports`),
  and one inside `declare global { … }` of any file, is global (rule 3 below), with the path of its file as above.
- `declare module 'name' { … }` with a name without `*` declares the module `name`: its declarations have the path
  `name` split at `/`, plus their name (`declare module 'legacy-lib' { export class Api {} }` is `legacy-lib.Api`).

## Module specifiers

`from '…'`, `require('…')`, `import('…')` and `import x = require('…')` name a module by a specifier:

1. A relative specifier (`./x`, `../x`) starts at the folder of the importing file.
2. A bare specifier (`@app/models`, `lodash`) means, in this order:
   1. a `paths` entry of the nearest `tsconfig.json` or `jsconfig.json` above the importing file (its `extends`
      included, the longest matching prefix first), then its `baseUrl`;
   2. an alias of the nearest bundler configuration (webpack, vite, vue.config), then a Module Federation remote;
   3. a workspace package: a project folder whose `package.json` has that `name`; a subpath (`@acme/core/model`) is
      the path below that folder (decision 5);
   4. a module that a project `declare module 'name'` declares;
   5. none of these: a library or Node module (`lodash`, `@angular/core`, `fs`); a name through it draws no edge.

A path found this way means the first file of:

1. the path as written, if it ends in one of the module endings above; a `.js`, `.jsx`, `.mjs` or `.cjs` ending tries
   the TypeScript file of the same name first (`./user.js` is `user.ts` when it exists), as TypeScript does;
2. the path plus `.ts`, `.tsx`, `.d.ts`, `.mts`, `.cts`, `.js`, `.jsx`, `.mjs`, `.cjs`, in this order;
3. the path as a folder: the file its `package.json` names in `types`, `typings` or `main`, else its `index` with the
   endings of 2.

A specifier that names no project file (a stylesheet, an image, a JSON file, a missing file) draws no edge.

What an import binds, in the module it is written in:

- `import { A } from './m'` binds `A` to the export `A` of `m`; `import { A as B }` binds `B` to it; `import type` the
  same. The export `A` of `m` is the declaration `m` exports under that name: its own (`export class A`, `export { X as
  A }`), its re-export declaration `A`, or for a module without either the declaration `A` that a `declare module`
  block gives it.
- `import D from './m'` and `import { default as D }` bind `D` to the default export of `m`.
- `import * as ns from './m'` binds `ns` to the module `m`: `ns.A` is the export `A` of `m`.
- `const x = require('./m')` and `import x = require('./m')` bind `x` to what `m` exports as `module.exports`
  (decision 10): `x` itself (called, constructed, extended) is its default export; `x.A` is a member of that default
  export where `module.exports = X` names a declaration (`x.create` with `module.exports = Svc` is a use of `Svc`), else
  the export `A` of `m`. A default import of a CommonJS module, `import X from './m.cjs'`, binds the same.
  `const { A, B: C } = require('./m')` binds `A` and `C` to the exports `A` and `B` of `m`. A CommonJS module exports
  `A` by `exports.A = …`, `module.exports.A = …` or `module.exports = { A, … }`.
- `import './m'` and a `require('./m')` whose result is not bound bind nothing: they are a use, by the script
  declaration of the importing file, of the script declaration of `m`, if `m` has one (decision 3).
- `import('./m')` is a module `m` loaded later: a name read from its result, `.then(m => m.A)`, `.then(({ A }) => …)`
  or `(await import('./m')).A`, is a use of the export `A` of `m` (decision 4).

An import binds a name and draws no edge of its own; an edge comes from a use of the name.

## A simple name `N`

Every identifier in code, in a type and in a decorator is a name, and so is the tag of a JSX element that starts upper
case. Looked up in this order; the first scope that binds `N` wins:

1. The enclosing block and function, then each one around it: a parameter, a type parameter, a `catch` or loop
   variable, a `const`, `let`, `var`, `function`, `class`, `enum`, `interface` or `type` declared there, and inside a
   namespace what the namespace declares: no edge (see Declarations), except a namespace member, which is a target.
2. The module: its top-level declarations and its import bindings. A module has at most one binding of a name, apart
   from declarations that merge (a `class` and an `interface` of the same name, a function and a namespace), which
   are one declaration.
3. A global declaration of the project (Declarations): several files that declare the same global name, as
   interfaces merge, are alternatives, and a use points at each of them (decision 9).
4. A global of the language or the runtime (`Array`, `Promise`, `JSON`, `window`, `document`, `console`, `process`,
   `require`, `module`): no edge.
5. None of these: no edge.

A lower-case JSX tag (`<div>`) is an element of the platform: no edge.

## A qualified name `p.N`

- If `p` is bound to a module (namespace import, `require`, a dynamic import's result), `p.N` is the export `N` of that
  module; when that export is itself a namespace or a re-exported module (`export * as m`), a longer chain walks on.
- If `p` is a namespace of the project and declares `N`, `p.N` is that declaration and `p` is no dependency of its own.
- If `p` is any other project declaration (a class, an enum, a variable), `p.N` is a member of it (a static method,
  an enum member): a use of `p`.
- Otherwise `p` is a value (`this`, a parameter, a call result): `p.N` is a member of its type, which the parser does
  not infer: no edge, also where `N` is the name of a project declaration.

## Vue components

- A `.vue` file is one module whose default export is the component: a declaration named after the file without
  `.vue` (`Button.vue` is `Button`), as Vue names a component after its file. What its `<script setup>` declares
  belongs to the component; what a plain `<script>` exports by name is a declaration of its own, as in a TypeScript
  module.
- The component uses what its script blocks use, by the rules above, and what its template names: the components of
  its tags, and the names in its expressions (`{{ format(date) }}`, `:item="defaults"`) that the script binds.
- A tag `T`, written `UserCard` or `user-card`, means, in the order the Vue compiler and runtime look it up:
  1. a Vue built-in (`component`, `transition`, `transition-group`, `keep-alive`, `teleport`, `suspense`, `slot`):
     no edge;
  2. a binding of `<script setup>` named `T`, written as is, in camel or in Pascal case;
  3. an entry of the component's `components: { … }` option under that name;
  4. the component that a project `app.component('T', X)` registers globally under that name, Pascal or kebab case;
  5. the component itself, when `T` is its own name;
  6. else the one Vue component of the project named `T` (auto-import); several: no edge (decision 6);
  7. none: an HTML element or a library component: no edge.

## Angular templates

- A template file (`.html`) is one declaration named after its file, the ending included and its dots written as
  underscores (`user.component.html` is `user_component_html`); the component that names it in `templateUrl` depends
  on it. An inline `template` is read like a template file, as a declaration `template` of the component's file that
  the component depends on.
- A template uses the components and directives whose selector matches one of its elements or attributes
  (`<app-badge>`, `<div appHighlight>`, `[appHighlight]="…"`), and the pipes it names (`| currency`). Such a name
  means:
  1. the class in the scope of the template's component, as Angular decides it: the `imports` of a standalone
     component, or the `declarations` and `imports` of the `@NgModule` that declares the component, where an imported
     module adds what it exports, a module it exports in turn included;
  2. else the one class of the project declaring that selector or pipe name (decision 6);
  3. several and the scope does not decide, or none (an HTML element, a library component): no edge.
- A class a decorator names is the class its file binds under that name, by the rules above.

## Probes

Each rule is tested by a probe under `sample-projects/regression/typescript/` (JavaScript ones under
`regression/javascript/`, Vue under `regression/vue/`, Angular under `regression/angular/`). "Gap" means the parser
does not follow the rule yet; the `known-gaps.md` of each folder says how it deviates.

| Rule | Probe | Today |
| --- | --- | --- |
| Declarations: the file path is the logical path | `spec-module-path` | ok |
| Declarations: a top-level declaration that is not exported | `spec-unexported-declaration` | ok |
| Declarations: every name a `const` binds, also by destructuring | `spec-variable-declaration` | gap |
| Declarations, decision 7: a namespace member is a leaf of its own | `spec-namespace-member` | gap |
| Declarations, decision 2: a named default export | `spec-default-named` | gap |
| Declarations, decision 2: an anonymous default export | `spec-default-anonymous` | gap |
| Declarations: `export default name` | `spec-default-identifier` | gap |
| Declarations, decision 3: top-level code is a script leaf | `spec-script-top-level` | ok |
| Declarations, decision 8: `export { A } from`, a use through a barrel | `spec-reexport-named` | ok |
| Declarations, decision 8: `export { A as B } from` | `spec-reexport-alias` | ok |
| Declarations, decision 8: `export { default as B } from` | `spec-reexport-default` | gap |
| Declarations, decision 8: an imported name exported again | `spec-reexport-imported` | gap |
| Declarations, decision 8: `export *` without default and unexported names | `spec-reexport-star` | gap |
| Declarations, decision 8: an own declaration over `export *` | `spec-reexport-star-own-wins` | ok |
| Declarations, decision 8: a name two `export *` offer | `spec-reexport-star-ambiguous` | gap |
| Declarations: `export { A as B }` without `from` | `spec-export-local-alias` | gap |
| Declarations and 3: a script file is global | `spec-global-script` | ok |
| Declarations and 3: `declare global` | `spec-declare-global` | ok |
| Declarations and specifiers 2.4: `declare module` | `spec-ambient-module` | ok |
| Specifiers 1: a relative specifier | `spec-relative-parent` | ok |
| Specifiers: a file before a folder of the same name | `spec-file-over-folder` | ok |
| Specifiers 1: `.js` written, the `.ts` file found | `spec-js-extension-maps-to-ts` | ok |
| Specifiers 2: the order of the endings | `spec-extension-order` | ok |
| Specifiers 3: a folder's `package.json` | `spec-package-json-types` | gap |
| Specifiers 2.1: tsconfig `paths` | `spec-tsconfig-paths` | ok |
| Specifiers 2.1: tsconfig `baseUrl` | `spec-tsconfig-baseurl` | ok |
| Specifiers 2.2: a bundler alias | `spec-bundler-alias` | ok |
| Specifiers 2.3, decision 5: a workspace package | `spec-workspace-package` | gap |
| Specifiers 2.3, decision 5: a subpath of a workspace package | `spec-workspace-subpath` | gap |
| Specifiers 2.5: a library | `spec-library-import` | ok |
| Specifiers: no project file | `spec-unresolved-specifier` | ok |
| Binding: `import { A as B }` | `spec-import-alias` | ok |
| Binding: `import type` | `spec-import-type` | ok |
| Binding: `import * as ns` | `spec-namespace-import` | gap |
| Binding: an import alone draws no edge | `spec-unused-import` | ok |
| Binding, decision 3: a side-effect import | `spec-side-effect-import` | ok |
| Binding, decision 4: a dynamic import read by name | `spec-dynamic-import` | ok |
| Binding, decision 4: a dynamic import not read | `spec-dynamic-import-unread` | ok |
| 1. a local class | `spec-local-declaration` | gap |
| 1. a parameter | `spec-parameter-shadows-import` | gap |
| 1. a type parameter | `spec-type-parameter` | gap |
| 2. declarations that merge | `spec-declaration-merging` | ok |
| 2 and 3: a module binding over a global | `spec-module-shadows-global` | ok |
| 3, decision 9: globals of one name in several files | `spec-global-alternatives` | ok |
| 4. a global of the runtime | `spec-builtin-global` | ok |
| Simple name: JSX tags | `spec-jsx-tag` | gap |
| Qualified: a chain through a re-exported module | `spec-qualified-chain` | ok |
| Qualified: a static member, an enum member | `spec-static-member` | ok |
| Qualified: a member of a value | `spec-member-on-value` | ok |
| Shared rule 1, name scope | `spec-name-scope` | ok |
| Shared rule 4, self | `spec-self` | ok |
| JavaScript, binding: `const x = require` | `javascript/spec-commonjs-require-module` | gap |
| JavaScript, binding: `const { A, B: C } = require` | `javascript/spec-commonjs-destructure` | ok |
| JavaScript, declarations: `module.exports = X` | `javascript/spec-commonjs-default` | ok |
| JavaScript, decision 10: a member of a required `module.exports = X` | `javascript/spec-commonjs-default-member` | ok |
| JavaScript, binding: `exports.A =` | `javascript/spec-commonjs-exports-property` | ok |
| JavaScript, decision 2: a named default export | `javascript/spec-js-default-named` | gap |
| JavaScript, binding: a default import of a CommonJS module | `javascript/spec-esm-import-commonjs` | ok |
| JavaScript, 3: a script file is global | `javascript/spec-script-global` | ok |
| JavaScript, decision 3: a `require` not bound | `javascript/spec-require-side-effect` | ok |
| Vue: the component is named after its file | `vue/spec-component-file-name` | gap |
| Vue tag 2: a binding of `<script setup>` | `vue/spec-script-setup-tag` | ok |
| Vue tags 3 and 4: `components` before a global registration | `vue/spec-components-option` | gap |
| Vue tag 4, decision 6: a global registration | `vue/spec-global-registration` | gap |
| Vue tag 6, decision 6: the one component of that name | `vue/spec-auto-import-unique` | gap |
| Vue tag 6, decision 6: several of that name | `vue/spec-auto-import-ambiguous` | ok |
| Vue tags 2 and 6: a binding decides between namesakes | `vue/spec-binding-over-auto-import` | gap |
| Vue: names in template expressions | `vue/spec-template-expression` | gap |
| Vue: a named export of a plain `<script>` | `vue/spec-plain-script-export` | gap |
| Vue tag 1: a built-in before a project component | `vue/spec-builtin-tag` | ok |
| Vue tag 5: the component itself | `vue/spec-self-reference` | ok |
| Angular: `templateUrl` and an element selector | `angular/spec-template-url` | ok |
| Angular 1: the imports of a standalone component | `angular/spec-standalone-scope` | ok |
| Angular 1: the NgModule and the exports of its imports | `angular/spec-ngmodule-scope` | ok |
| Angular 2, decision 6: the one class of a selector | `angular/spec-unique-selector` | ok |
| Angular 3: several classes, no scope decides | `angular/spec-ambiguous-selector` | ok |
| Angular: an attribute directive | `angular/spec-attribute-directive` | gap |
| Angular: a pipe | `angular/spec-pipe` | ok |
| Angular: an inline template | `angular/spec-inline-template` | ok |

## Not supported

- `.d.ts` files next to a `.js` file of the same name, and a `.js` file next to a `.ts` file of the same name
  (compiled output): the module is the first of the endings above, but both share one logical path (shared rule 2).
- Module augmentation (`declare module './user' { interface User { … } }`) and global augmentation of a library type
  (`interface Window` in `declare global`) pointing back at the library: the project declaration is the only target.
- Names in JSDoc types (`/** @type {import('./x').Foo} */`), in strings, and computed or conditional `require` paths.
- The type of a value: `p.N` on a parameter, a variable or a call result draws no edge (see qualified names).
- `exports` and `imports` maps of a `package.json` beyond its `types`, `typings` and `main` fields, conditional exports,
  and `node_modules` folders inside the analysed folder.
- Vue: components registered by a plugin other than `app.component`, `defineAsyncComponent`, and the
  `name` option as the component's name.
- Angular: selectors with `:not(…)` or several elements, directives matched through `hostDirectives`, and modules
  returned by a `forRoot()` call.

## Decisions

1. TypeScript, JavaScript, Vue and Angular templates are specified and implemented together, on one page (decided
   2026-10-23).
2. A named default export is the declaration under its own name, an anonymous one a declaration `default`;
   JavaScript and TypeScript the same (decided 2026-10-23).
3. Top-level code outside every declaration is a script declaration `<file>.script`, as in PHP; a side-effect import
   is a use of the imported file's script declaration (decided 2026-10-23).
4. A name read from the result of a dynamic import is a use of that export (decided 2026-10-23).
5. A bare specifier that no configuration maps means the workspace package of that `package.json` name, else a
   library (decided 2026-10-23).
6. A template tag that no binding or scope decides means the component a Vue `app.component` registers under that
   name, else the one project component or class of that name or selector; several mean none (decided 2026-10-23).
7. A declaration a namespace exports is a declaration of its own, as a Java member type and a Python nested class
   (java.md decision 1, python.md decision 4).
8. A use through a re-exporting file points at its re-export declaration, which points at what it re-exports, as a
   Python package's `__init__.py` (python.md decision 2).
9. Global declarations of the same name in several files are alternatives, and a use points at each, as Python
   alternative bindings and Go build-tag variants (python.md decision 5, go.md decision 3).
10. A name `require` binds stands for the module's `module.exports`, as at runtime: with `module.exports = Svc`,
    `x.create` is a member of `Svc` and a use of it, as `Color.Red` is a use of the enum `Color`; with
    `module.exports = { A, … }` or `exports.A = …`, `x.A` is the export `A` (decided 2026-10-23).
