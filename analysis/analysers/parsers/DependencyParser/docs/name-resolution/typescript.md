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
  (`main.script`), that uses what this code names; imports and exports are no such code (decision 3).
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
- `const x = require('./m')` and `import x = require('./m')` bind `x` to the module `m`: `x.A` is the export `A` of
  `m`, and `x` itself (called, constructed, extended) is its default export. `const { A, B: C } = require('./m')`
  binds `A` and `C` to the exports `A` and `B` of `m`. A CommonJS module exports `A` by `exports.A = …`,
  `module.exports.A = …` or `module.exports = { A, … }`.
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
- A tag `T`, written `UserCard` or `user-card`, means:
  1. a binding of `<script setup>` named `T`, written as is, in camel or in Pascal case;
  2. an entry of the component's `components: { … }` option under that name;
  3. the component itself, when `T` is its own name;
  4. the component that a project `app.component('T', X)` registers globally under that name, Pascal or kebab case;
  5. else the one Vue component of the project named `T` (auto-import); several: no edge (decision 6);
  6. none: an HTML element, a Vue built-in (`component`, `transition`, `keep-alive`, `slot`) or a library component:
     no edge.

## Angular templates

- A template file (`.html`) is one declaration named after its file, the ending included (`user.component.html`);
  the component that names it in `templateUrl` depends on it. An inline `template` is read like a template file, and
  its uses are those of the component.
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
