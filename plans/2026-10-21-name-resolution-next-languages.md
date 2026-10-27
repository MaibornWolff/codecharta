---
name: dependency parser name resolution, the remaining languages
state: progress
version: 1
---

## Goal

Bring every language of `ccsh dependencyparser` to the state Java and Kotlin reach in
`plans/2026-10-21-name-resolution-spec.md`: its name rules written down, probes derived from them, and the resolver
following them, in small commits Christian reviews one by one. Branch `fix/dependency-name-resolution`.

## Resume here (for a fresh agent)

- **State:** Java, Kotlin, C#, Go, Python, TypeScript, JavaScript, Vue and Angular templates, C and C++, PHP are done
  and pushed (last: `fix/dependency-name-resolution-php`). Rust is done and pushed (`fix/dependency-name-resolution-rust`).
  Delphi is in progress on `fix/dependency-name-resolution-delphi`, see "Delphi" below. After it: SQL.
- **Branches, stacked:** one branch per language, cut from the previous language's branch once Christian has pushed
  it (`git switch -c fix/dependency-name-resolution-<language>` on top of it), never from `main`. Small commits, one
  per item of the announced numbered list; Christian reviews the branch as a whole when the language is done. Tell him
  then, with the commit list, the checks and the regressions; he pushes.
- **Rules from Christian:** ask before every modelling decision, with a drawn example; whenever unsure about anything
  else (notation, accepting new warnings, a shortcut, commit order), ask with the AskUserQuestion tool and a recommended
  option instead of deciding alone; only the analysis gate runs on this branch (no visualization code changes); one commit per change, test
  first; structural changes in their own `refactor` commit before the behaviour change; a language's rules in its own
  folder; report every regression as "correct but regression" (the new output follows the spec) or "bad and
  regression" (fix it before the commit); commit only in an `&&` chain behind the green checks; diff every edit of a
  `known-gaps.md` against HEAD before committing.
- **Tools** (`.claude/name-resolution-tools/`, git-ignored): `ccsh-baseline` (the release build), `cp-probes` (the
  197 checkpoint probes) with `cp-compare.py`, `edgediff.py`, `lines.py`, and two scripts that take build tags; a
  build tag is a copy of `analysis/build/install/codecharta-analysis` in `ccsh-<tag>`, and `ccsh-py12` is the head
  of the Python branch, the comparison build for the first commit of the next language:
  - `accept.sh <prev> <new>`: edge diffs on samples, `analysis/`, `visualization/app`; the probes against their
    expectations; the checkpoint probes against the release; the gate on analysis.
  - `xcheck.sh <prev> <new>`: the whole output of both builds on every sample, probe, checkpoint probe, `analysis/`
    and `visualization/app`; for a refactor it must say 0 differences, otherwise only the language's files may differ.
- **Faster tools (2026-10-23, asked for by Christian):** `xlang/compare.py` and `cp-compare.py` run 12 at a time and
  cache: a build's normalized output per input under `cache/ccsh-<tag>/` (keyed by the input's files, sizes and
  mtimes; `chain.sh` clears the new tag's cache), the release baseline's probe lines in `cache/cp-baseline.json`.
  `chain.sh` runs `integrationTest` beside the comparisons and fails at the end if it failed; `accept.sh` prints
  `FAILED FILE <part>: …` for a file the new build could not analyse, which no gate or test catches. A chain takes about
  3 minutes. Helpers in `scratch/`: `rmgap.py <known-gaps.md> <probe>...` deletes gap sections, `probecheck.sh <tag>
  <probe dir>...` diffs probes against `expected.txt`, `dump.sh <grammar:path>...` prints tree-sitter trees (needs the
  untracked `ScratchTreeDumpTest.kt` in TSE `src/test/.../shared/infrastructure/ffm/`, never commit it).
- **One commit, the chain** (`chain.sh <prev> <new>` in the tools folder runs all of it): `cd analysis &&
  ./gradlew ktlintCheck test && ./gradlew distTar installDist && ./gradlew integrationTest`, copy the build to
  `ccsh-<tag>`, `npm run format:check`, `accept.sh`, `xcheck.sh`, then commit. A run with `--bypass-gitignore` also reads `build/` copies of test resources; edges between such copies are
  no regression of real code.

## How one language is done

1. **Spec.** `analysis/analysers/parsers/DependencyParser/docs/name-resolution/<language>.md`, one page, in the shape
   of `java.md`: declarations and their logical path; where a simple name is looked up, in order, first match wins,
   from the language's specification; qualified names; what is not supported; open questions. Ask Christian every
   open question (AskUserQuestion, with a drawn example when it is about modelling), write the answers into the page
   as decisions. Points derived from earlier decisions or other languages go into the page as decisions too, without a
   separate review round (Christian, 2026-10-26).
2. **Probes.** One per rule and per collision of two rules, under `sample-projects/regression/<language>/spec-<rule>/`
   (`src/`, `expected.txt` whose first line names the rule). The expected edges come from the rule, never from the
   parser's output; keep probes free of cycles unless a rule is about cycles. Run them; every deviation becomes a
   section of `sample-projects/regression/<language>/known-gaps.md` (why, then `missing`/`extra` lines), and
   `FINDINGS.md` of the language points at that file. Add a table rule → probe → ok/gap to the spec page.
3. **Implementation.** One commit per group of gaps, test first: delete the gap lines, see the probe fail, fix, see
   it pass. Change only that language (or its name scope); a structural change goes into its own `refactor` commit
   before the behaviour change.

## Acceptance of every commit

- `./gradlew ktlintCheck test`, then `./gradlew distTar installDist` **as a command of its own** (a failing test
  stops Gradle before `installDist`, and a stale `ccsh` falsifies every measurement), `./gradlew integrationTest`,
  `npm run format:check`, `ccsh gate analysis --quiet` with 0 errors and no new warnings (no visualization gate: the
  branch changes no visualization code, Christian 2026-10-23; the edge diff on `visualization/app` stays).
- `python3 sample-projects/tools/compare_dependency_builds.py <ccsh>`: 0 differing.
- Edge diff against the previous commit's build on `sample-projects` (`-e regression`), `analysis/` and
  `visualization/app`, file edges and leaf edges; explain every change in the commit message. Edges of files the
  commit itself adds or changes are expected.
- The checkpoint's 197 reviewer probes, `git archive b4a6bb8af sample-projects/regression | tar -x -C <dir>`, run
  against the release build and the new one: no probe may lose a correct line or gain a wrong one, unless a decision
  in a spec page says the probe's expectation is outdated (state which).
- CHANGELOG (one bold title and one sentence, Added for new things, Fixed for fixes), the README and
  `gh-pages/.../dependency.md` where the behaviour is described, the spec page's table.

## Conventions learned so far

- Shared rules live in `docs/name-resolution/README.md` and change every language; say so in the commit and measure
  all languages.
- A copy rule follows the using file's language, never the logical path: `CopyRules` per language, `NearestCopy` by
  default, `SqlCopyRules` (latest migration) and `CSharpCopyRules` (every file of the nearest project) in their folders.
- A language's own rules live next to its analyzer (`analyzers/<language>/`): `NameRules` (lookup order, step after
  resolution), `CopyRules`; `processing/dependencies/LanguageRules` picks them. Shared code changes only when it is
  good for every language and the cross-language check shows the others unchanged; Christian says yes first.
- In `treeSitterExcavationSite`, `shared/domain` holds only what every language uses; a helper of a language family
  lives in one language's folder (`kotlin` uses `java`'s `LocalTypeScopes`, `cpp` uses `c`).
- An existing test that encodes behaviour a spec decision changed is rewritten to the decision, with its name.

## Order and state

- Done: Java, Kotlin (see the plan above), C#, Go, Python, TypeScript and JavaScript (with Vue and Angular
  templates), C and C++, PHP. Next, by Christian's choice when asked: Rust, Delphi, SQL.
- Material: the checkpoint branch `fix/nearest-file-for-shared-logical-path` holds an earlier, unreviewed attempt and
  its reviewer probes; use them for ideas and as the regression net, not as code to copy.

## C# (done, 2026-10-22)

Spec `docs/name-resolution/csharp.md` (decisions 1–6), 39 probes under `sample-projects/regression/csharp/`, no gap
left. The first part is on `main`; the rest (`file` types, copies by project) is on branch
`fix/dependency-name-resolution-csharp`, waiting for Christian's push and review. Checkpoint probes worse than the
release by decision: `java/r1-jnest` (nested = own leaf), `csharp/r3-cs2proj`, `r3-csmix`, `r3-csnested` (copies
without a `.csproj` are one project).

## Go (done, 2026-10-22)

Spec `docs/name-resolution/go.md` (decisions 1–5), 29 probes under `sample-projects/regression/go/`, no gap left; all
on branch `fix/dependency-name-resolution-go`, waiting for Christian's push and review. Import paths go through
`GoModules` (`go.mod`, `vendor/`, suffix fallback), `GoImports` writes a selector through an import as the full path,
`GoNameRules` resolves it and simple names (own package, dot imports, predeclared), `GoCopyRules` points at every
build-tag variant, `LocalNames` in the extractor hides what a function declares. Checkpoint probe worse than the
release by decision: `go/r3-g1` (`LocalType -> closure.go#util`, a function-local type is no target). The go.mod
mapping and `GoNameRules` had to go into one commit, and the external test package before the copy rule: either alone
drew wrong edges.

## Python (done, 2026-10-23)

Spec `docs/name-resolution/python.md` (decisions 1–5), 40 probes under `sample-projects/regression/python/`, each
checked in CPython 3.14, no gap left; all on branch `fix/dependency-name-resolution-python`, waiting for Christian's
push and review. Christian: "do it like the interpreter does it, else like the other languages". The extractor finds
the binding Python sees for every name (`LocalScopes`, `ModuleBindings`, `ScopeBindings` with branches, `PythonUses`)
and reports a use as module prefix (`.` per leading dot, last `*` for a wildcard import) plus dotted name, with
`fallbacks` for wildcard imports; the analyzer writes the paths it can have (`ModuleCandidates` over the import roots
of `PythonModules`, `WildcardExports` reading `__all__`), and `PythonNameRules` takes the first that is a declaration.
Shared change, approved by Christian: `UsedType.fallbacks` (TSE) and `Type.fallbacks` (parser, tried by
`NodeResolution`). Checkpoint probes worse than the release by decision: `python/r1-pyroot` (the file's folder and
the suffix fallback are roots), `r3-p4` (package before module), `r5-nested-class-shadow` (a nested class is a leaf of
its own; `Outer.Node` is no use of `Outer`). Order lessons: the import roots had to wait until a name behind a module
alias resolved through it and attribute names stopped being plain names, or `am.Model` lost to the bare `Model`; a
decision asked mid-way (5, alternatives) went in as spec, probes, then the implementation.

## TypeScript, JavaScript, Vue and Angular templates (done, 2026-10-26)

Branch `fix/dependency-name-resolution-typescript`, cut from the pushed Python branch; comparison build of the first
commit `ccsh-py12`, then `ccsh-ts<n>`. Christian chose all four at once and decisions 2 to 6 of
`docs/name-resolution/typescript.md`; 7 to 9 follow Java, Python and Go. 78 probes under
`sample-projects/regression/{typescript,javascript,vue,angular}/`, 39 gaps at the start. Every TypeScript probe compiles
in tsc 6.0.3 (`visualization/node_modules/.bin/tsc`, moduleResolution bundler).

Target design, as Python: the extractor finds the binding of every name (scopes in TSE `languages/javascript`) and
reports a use as its module specifier plus the exported name and the members behind it; the analyzer (`typescript/`,
shared by JavaScript and Vue) resolves the specifier to a file (`ModuleFiles`), the name to what that module exports
(`ModuleExports`, read per file and cached per analysis root, as Python's `WildcardExports`) or to a global
(`GlobalDeclarations`), and writes the exact path; the name rules then take a path only as written.

Steps, one commit each:

1. [x] refactor: TypeScript, JavaScript and Vue get name rules of their own, the default ones for now
2. [x] a top-level declaration that a module does not export is file-scoped
3. [x] a module specifier means the file the compiler finds (endings, `.js` for `.ts`, `package.json`, `index`)
4. [x] a bare specifier means the workspace package of that name
5. [x] default exports: a named one under its own name, an anonymous one `default`, a default import finds it
6. [x] `export { A as B }` without `from` names the own declaration
7. [x] an imported name exported again is a re-export
8. [x] `export *` without the default export, unexported and ambiguous names
9. [x] `export * as ns` is a module, a chain through it walks on
10. [x] names a function, block, class or type parameter binds hide the module's
11. [x] a lower-case JSX tag is no name; every name through a namespace import is one
12. [x] a name bound by destructuring is a declaration
13. [x] what a namespace exports is a leaf of its own
14. [x] top-level code is a script leaf
15. [x] a side-effect import or unbound `require` uses the script leaf
16. [x] a name read from a dynamic import's result
17. [x] globals of script files and `declare global`
18. [x] CommonJS: `require` binds the module, `module.exports` is the default export
19. [x] resolve a name only through the binding the compiler sees (the heuristics go), branch
    `fix/dependency-name-resolution-typescript-bindings`:
    1. [x] a renamed import binds its local name (TSE keeps it, `MemberImports` maps it)
    2. [x] refactor: every named import of a project module is written as the path of its export
    3. [x] refactor: a name an import of no project file binds is written as the import's path
    4. [x] refactor: a name the own module declares is written as its path (`OwnNames`)
    5. [x] `TypescriptNameRules` takes a name only as written, as `PythonNameRules`
    6. [x] a member chain through an upper-case namespace import is one name (refactor: test move before)
    7. [x] no use of an upper-case method called on a value (TSE `methodCalls` gone)
    8. [x] refactor: no guessed `index` dependency
    9. [x] JavaScript expands `export *` as TypeScript does (refactor: `StarExports` before; Christian chose it)
    10. [x] `import x = require` binds the module; the type of a type predicate is a use; decision 15, an import type
        `import('./m').A` is a use of the export (all three found on the sample, Christian chose to fix them)
20. [x] Vue: a default import of a `.vue` file names its component
21. [x] Vue: tags by binding, `components`, global registration, the one component
22. [x] Vue: template expressions are uses, an import alone is none
23. [x] Vue: named exports of a plain `<script>` (closed by step 22)
24. [x] Angular: a template element matches selectors as the compiler does (decision 14, branch
    `fix/dependency-name-resolution-angular`, 8 gaps):
    1. [x] TSE: a `@Component` or `@Directive` selector as its alternatives (`AngularSelector`)
    2. [x] TSE: a template's elements as selectors: tag, static attributes, classes
    3. [x] TSE: property, two-way and event bindings as attributes
    4. [x] TSE: a structural directive as an `ng-template` element with its microsyntax keys
    5. [x] a template element uses every class whose selector matches it (template nodes carry their elements
       first, two test moves as refactors before)
    6. [x] refactor: a template reports only pipe names, a class only its pipe name
25. [x] changelog, README, gh-pages, the extractor's README, the spec table (no gap left), FINDINGS.md of the four
    samples, plan

### Resume after TypeScript here (2026-10-26, steps 19 and 25 done)

- **Branch** `fix/dependency-name-resolution-typescript-bindings`, waiting for Christian's review and push; **last
  build** `ccsh-b13` (head before the docs commit), the next language's first chain is `chain.sh b13 <tag>`.
  Checkpoint probes worse than the release: the nine known, no new one. No gap left in any of the four folders.
- **How it is built:** the analyzer writes every bound name in full (`MemberImports` for imports of project files and,
  by `bindOutsideProject`, of libraries and `declare module`; `OwnNames` for the module's own and namespace names;
  `QualifiedNames`, `GlobalUses`, `StarExports` as before), and `TypescriptNameRules` only looks the path up, as
  `PythonNameRules`; a name left simple means nothing. TSE reports a renamed import under its local name and a member
  read through any namespace or default import, or on an `import()` call that is not called, as one name.
- **Samples:** `typescript` and `vue` draw exactly the expected number of file edges of their FINDINGS (79/85, 93/99).

### Resume Angular here (2026-10-26, Angular done: step 24)

- **Branch** `fix/dependency-name-resolution-angular`, waiting for Christian's review and push; **last build**
  `ccsh-ang8` (head), the next chain is `chain.sh ang8 ang9`. Checkpoint probes worse than the release: the nine known,
  no new one. No gap left in `regression/angular/`.
- **Decision 14** (Christian, 2026-10-26): an element is matched as Angular's `SelectorMatcher` does (tag, attributes
  with values, bindings `[x]` `[(x)]` `(x)` and their `bind-`/`on-`/`bindon-` forms, classes; a structural directive
  is an `ng-template` with `x` and `x<Key>`); every match is a use; a selector several classes declare goes through
  the scope as before. Expected lines of the probes come from Angular 22's compiler: `node
  .claude/name-resolution-tools/ng/ngmatch.mjs <probe src>` prints per element the classes it matches.
- **How it is built:** TSE `AngularSelectorParser` (decorator selector → `AngularDeclaration.selectors`, `@Directive`
  read too), `TemplateElements` + `StructuralDirectives` (template → `AngularDeclaration.elements` on the template's
  SCRIPT declaration; Christian chose this over a new `Declaration` field), template used types = pipe names only,
  `pipeName` replaced `templateNames`. Parser: template nodes carry `AngularMetadata(elements)`,
  `AngularSelectorMatch.matches`, `AngularTemplateReferences` groups matching classes by selector alternative.
- **Not supported:** `hostDirectives` (the four unmatched `cc*` directives of `visualization/app` are host directives),
  `forRoot()`, microsyntax keys tree-sitter-angular cannot parse (`then` without a colon).
- **Next:** 19 (drop the heuristics), 25 (changelog, README, gh-pages) as below.

### Resume Vue here (2026-10-23, Vue done: steps 20 to 23)

- **Branch** `fix/dependency-name-resolution-vue`, waiting for Christian's review and push; **last build**
  `ccsh-vue17` (head), the next chain is `chain.sh vue17 vue18`. Checkpoint probes worse than the release: the nine of
  "Resume TypeScript here", no new one; `mixed/r1-tsvue`, `r2-vue1`, `r3-p3-vue` are better.
- **Step 21 as done:** TSE drops Vue's built-in tags and marks every other tag `COMPONENT_TAG`; the API
  `TreeSitterDependencies.vueComponentRegistrations` (Christian chose it over a text scan) reads `.component('Name', X)`
  calls and a plain script's `components` option. `ComponentTags` looks a tag up in the spec's order: binding (with
  `<script setup>`, as written or camel), `components` option, `GlobalComponents` (registrations, through the
  registering file's imports), self, `VueComponents` (the one `.vue` file of that name); otherwise no edge. The
  project scans read `FileInfo.analysedFiles` (shared, approved: the run's files after excludes; empty = every file
  below the root). Decision 13: `defineAsyncComponent(() => import('./X.vue'))` is a use of `X`'s default export
  (`AsyncComponents` in the TSE JS extractors). `typescript/tsconfig` moved to `common/tsconfig` to break the gate's
  `common <-> typescript` cycle (Christian).
- **Decisions of this branch** (spec `typescript.md`): 11, a plain `<script>` is the module's top level (unexported
  declarations and top-level code are leaves, as in a TS module), `<script setup>` part of the component; 12, template
  names are looked up as the compiler does: with `<script setup>` in its and the plain script's bindings, `v-for` and
  slot names local; without `<script setup>` instance members, no edge. Also: a pug template is read for its tags
  (Christian), its expressions not (Not supported); a shorthand property `{ format }` is a use (TS/JS fix).
- **How it is built:** TSE `ScriptBlockExtractor` gives `<script setup>` the component (`DEFAULT_EXPORT`) as owner and
  appends `TemplateExpressions` (the template as script code: expressions, handlers as function bodies, `v-for`/slot
  names as arrow parameters); `DependenciesFacade` hands every embedded source's imports to the file and a file-owned
  source's declarations to the file (only Vue has such sources; Christian chose this over a Vue-only API).
  `ComponentExtractor` reads tags (HTML, or `PugTemplate`). `VueAnalyzer` extends the now open `TypescriptAnalyzer`
  and overrides its `declaredNodes()` step (Christian chose this over a hook in `BaseLanguageAnalyzer` and over relying
  on TSE's order): merges the component nodes (template, plain default export, the declaration `export default X`
  names), adds the setup uses without setup-own names, unmarks free names the plain script binds, writes plain-script
  names in full.
- **Gaps left (1):** angular `spec-attribute-directive`.
- **Next:** 24 (Angular attribute directives), 19 (drop the heuristics), 25 (changelog, README, gh-pages) as below.

### Resume TypeScript here (2026-10-23, after step 18 and spec-reexport-default)

- **Last build** `ccsh-ts49` (head of the branch); the next chain is `chain.sh ts49 ts50`. Checkpoint probes worse than
  the release: the eight known by decision (Java, C#, Go, Python) plus `typescript/r3-p3-ts`, worse by decision 7 (it
  draws `Circle -> Shapes.Circle` where the checkpoint expects the namespace as one leaf, `Circle -> Shapes`).
- **Gaps left (7 of 40):** vue `spec-auto-import-unique`,
  `spec-binding-over-auto-import`, `spec-components-option`, `spec-global-registration`, `spec-plain-script-export`,
  `spec-template-expression`; angular `spec-attribute-directive`.
- **Next steps in order:** the Vue plan below (steps 20–23), then 24 (Angular attribute directives), then 19 (drop the
  heuristics: `TypescriptNameRules` still delegates to `DefaultNameRules`), then 25 (changelog, README, gh-pages).
- **Step 9 as done:** a use through an imported binding is rewritten by `MemberImports` on the finished nodes (types,
  not TSE uses): first segment = binding, the rest a member path, shorter paths down to the declaration as fallbacks; a
  namespace import binds its module (`Target.moduleFile`), and `ModuleExports.moduleExportOf` walks `export * as`
  (no `*` declaration, `bindingName` on the import). The extractor reports `ns.a.b` as written, a value chain whole.
- **Step 14 as done:** `TopLevelCode` (TSE) makes one `SCRIPT` declaration of the statements outside every
  declaration, import, export, directive and CommonJS export; `ScriptLeaf` (analyzer) names it `<file>.script`, which
  the map writes `<file>_script` (probes use that form, the spec page says so; confirmed by Christian: the leaf is the
  anchor that top-level code and side-effect imports draw edges from and to).
- **Steps 15–16 as done:** a side-effect import or bare `require('./m')` is reported (`TopLevelCode`) as a use named
  `MODULE_SCRIPT` with the specifier as `namespacePrefix`; `ModuleScriptUses` (analyzer) writes it as the module's
  script leaf. A dynamic import is a namespace import bound to `dynamic_import_<offset>` (`DynamicImports`);
  `DynamicImportBindings` finds what its result binds (callback parameter, awaited declarator, destructuring) and
  `NamespaceMembers` writes reads through it, so `MemberImports` resolves them as namespace-import names.
- **Step 17 as done:** TSE marks a global declaration (script-file top level, `declare global`) with a leading
  `GLOBAL` parent-path segment (`DeclarationScopes` in the analyzer drops it), and a use of a name no module binding
  binds with `namespacePrefix = [GLOBAL]`; free lower-case names are reported now, a declaration's own name and the
  names its patterns bind are not. `GlobalDeclarations` reads the globals once per root (files without
  `import`/`export`/`exports`/`require` text or with `declare global`; this text prefilter confirmed by Christian), `GlobalUses` writes a marked use as each global
  of its name, else keeps an upper-case one as written and drops a lower-case one.
- **Step 18 as done:** decision 10 (Christian): a `require` binding or default import stands for `module.exports`;
  `module.exports = X` / `export = X` is the default export (`DefaultExportClassifier`), `x.A` is a member of it, else
  (no default declaration, `module.exports = { A }`) the export `A` (`MemberImports` binds the module); the extractor
  reports `x.A` through such a binding as one name (`ModuleNames.defaultImportNames`).
- **spec-reexport-default as done:** `export { default as B } from './m'` reports its use as `DEFAULT_EXPORT` with the
  specifier as prefix; `DefaultExportUses` writes it as `ModuleExports.defaultPathOf` (the `.vue` rule moved there).
- **Vue plan (steps 20–23, not started):** `VueAnalyzer` today makes one component node whose uses are the template's
  tags (Pascal case, `ComponentExtractor` in TSE) and the name of every import; it resolves no binding. Proposed order,
  analyzer before TSE each time, ask Christian where unsure:
  1. step 20: resolve the imports of the script blocks as `TypescriptAnalyzer` does (`ImportedModules`, `MemberImports`;
     a default import of a `.vue` file is the component node, `ModuleExports.defaultPathOf`);
  2. step 22: TSE reports the names of template expressions (`{{ format(date) }}`, `:title="defaults.size"`) and the
     analyzer counts an import only where the script or template uses it (gap `spec-template-expression`);
  3. step 21: tags in the spec's order: a script-setup binding (as written, camel, Pascal), the `components` option
     (TSE reads `components: { CreatureCard: Card }`), a global `app.component('Name', X)` (project scan like
     `GlobalDeclarations`), the component itself, else the one `.vue` file of that name (project scan); gaps
     `spec-binding-over-auto-import`, `spec-components-option`, `spec-global-registration`, `spec-auto-import-unique`;
  4. step 23: what a plain `<script>` exports by name is a leaf of its own (gap `spec-plain-script-export`).
- **Follow-up for step 19:** a member chain through an upper-case namespace import (`Gen.createTreemapNodes`) still
  reports the namespace only; reporting the chain made `React.Component` (a library) fall to the heuristics and hit
  the file's own `Component`. A use through a library namespace should draw nothing first.
- **Where things are:** extractor `treeSitterExcavationSite/.../languages/javascript/extractors/`: `ExportedNames`
  (file scope), `LocalScopes` + `BindingPatterns` (step 10, values and types apart; dynamic-import callbacks and
  `await import`/`require` destructuring are module bindings, no locals), `ModuleNames` in `DeclarationPrepass`
  (aliases, namespace import names, own names), `NamespaceDeclarations`, `DefaultExportClassifier`; markers
  `DEFAULT_EXPORT`, `AMBIENT_MODULE` (first parent segment of a `declare module` member; any other parent path lies
  below the file), import kinds `MEMBER`/`REEXPORT`. Analyzer `analyzers/typescript/`: `ModuleFiles`, `ImportedModules`
  (specifier to file, logical path), `WorkspacePackages`, `PackageJson`, `ModuleExports` (default name, own name of an
  export, named exports, `export *` with ambiguity), `MemberImports` (rewrites uses of default and renamed imports to
  full paths), `DefaultExports` (drops re-export nodes that name an own declaration), `QualifiedNames` (dotted names get
  their prefixes as `Type.fallbacks`, own-file ones a full path), star expansion in `TypescriptAnalyzer`.
- **Lessons:** read the whole-output diff of every chain, not only the edge counts: a file that throws drops all its
  edges (`relativeTo` on a relative analysis root did, now caught by `FAILED FILE`). An extractor change that removes
  a heuristic can unmask another (lower-case members of every import counted as namespace members; split the step and
  add the missing distinction first). Commit messages: commitlint warns on a body line that starts like a footer
  (`Edges: …` after a blank line), harmless.

## C and C++ (done, 2026-10-26)

Branch `fix/dependency-name-resolution-c-cpp`, cut from the pushed `-typescript-bindings`; comparison build of the
first commit `ccsh-b13`. Christian: "do it like the compiler does it, else like the other languages". Ground truth:
clang from zig in the session scratchpad (`pip install --target <dir> ziglang`, `zig c++ -fsyntax-only -Xclang
-ast-dump`). Spec `docs/name-resolution/cpp.md`, decisions 1–7 chosen by Christian on 2026-10-26: include closure
only; include path own folder, then path suffix, nearest; `.cpp` implementation part as leaf that uses the header's
class; types and aliases (no functions); forward declaration means the body anywhere; global-namespace path is the
name alone; one leaf per typedef'd struct. Decisions 8–12 derived from these and Java/Go, written into the page
(Christian, 2026-10-26: no separate spec review, follow the plan and write such points down).

### Resume C/C++ here (2026-10-26, C and C++ done)

- **Branch** `fix/dependency-name-resolution-c-cpp`, waiting for Christian's review and push; **last build** `ccsh-cc29`
  (head before the docs commit), the next language's first chain is `chain.sh cc29 <tag>`. No gap left. Checkpoint
  probes worse than the release: the nine known plus three by decision (`cpp/r1-cpp1` decision 4, `c/r2-csrc`
  decision 5, `cpp/r3-p3-cpp` decision 3); 101 better.
- **Open, left to `plans/2026-10-23-cycles-per-declaration-copy.md`** (Christian, 2026-10-26): header and
  implementation part, and two programs' global structs, are copies of one path, and the cycle search keeps one copy's
  dependencies; C++ loses the flag of `Creature.hpp -> ArmorClass.hpp`, C the cycle `creature.h <-> fightable.h`.
- **Not done, by decision 4 or Not supported:** functions, prototypes, variables and macros as declarations; function
  pointer typedefs; the build's include directories; preprocessor conditions; `using enum`, lambda parameters,
  temporaries, constraints (extraction coverage in the C++ FINDINGS).
- **How it is built:** `CppIncludes` (include lines as text, any file below the root, depth-first closure),
  `CppDeclarations` (TSE facts per C/C++ file, `visibleNamesOf(file)`), `CppFileFacts` (classes, forward declarations
  and aliases by path; using-declarations, -directives, namespace aliases), `CppVisibleNames` (the lookup),
  `CppAnalyzer` (exact paths, unresolved uses left out, template arguments kept), `CppNameRules` exact,
  `CppCopyRules` (closure copy, else nearest). TSE markers: `FORWARD_DECLARATION`, `ALIAS` first parent segments;
  namespace alias = import with `bindingName`.
- **Helpers** in the tools folder `cpp/`: `mkprobes.py [lang/probe]` writes the probes (and `probe-meta.json`),
  `compile-probes.sh` compiles each probe file alone (`ZIG=<path to zig>`, from `pip install --target <dir> ziglang`);
  `scratch/regen-gaps.py [lang/probe=cause]` rewrites both known-gaps.md and the spec table from `scratch/pc-<lang>/`,
  filled by `probecheck.sh` (clear `scratch/pc` first, it keeps stale files). `lines.py` now prints usage and flags.
- **Lesson:** a switch to exact names loses every line the old heuristics found by accident; run the checkpoint
  probes on a prototype first, land what it needs (TSE facts) as commits without output change, then the switch.

1. [x] spec page
2. [x] probes: 44 under `sample-projects/regression/{c,cpp}/spec-*`, 27 gaps at the start; every probe compiles in
   clang (`compile-probes.sh` and `mkprobes.py` in the scratchpad generate and check them)
3. [x] refactor: C and C++ get name rules of their own (`CppNameRules`), the default
   ones for now; `CppCopyRules` comes with step 5
4. [x] `CppIncludes`: an include path means the file of the include rules, a file sees its include closure (project
   scan, cached per analysis root, as `CSharpProjects`)
5. [x] TSE reports forward declarations below a `FORWARD_DECLARATION` parent segment; the analyzer makes no node of
   them (reordered 2026-10-26: dropping the merge first let the default rules draw C++ headers into the C sample, a
   bad regression; the parked work is `step-copies.patch` in the scratchpad)
6. [x] TSE marks a C++ base class as a use of kind inheritance, as Java does (rule 2 needs the bases)
6b. [x] TSE reports the tag of `typedef struct Stable Stable;`, namespace aliases, type aliases (`ALIAS` segment) and
   the class of an unqualified `friend class X;` (forward, its namespace); `CppIncludes` follows includes through a file
   of any extension (decision 13) and joins continued lines; each its own commit without output change, found when the
   switch below lost checkpoint lines
7. [x] the switch: `CppDeclarations` (facts of every file, cached per root), `CppVisibleNames` (lookup of cpp.md over
   the include closure: class scopes with direct bases, enclosing namespaces, using-declarations, using-directives at
   their landing level, namespace and type aliases as qualifiers, ambiguity), `CppTargets` (a global declaration's node
   path still starts with the file that has its body), the analyzer writes uses exactly or leaves them out,
   `CppNameRules` exact; 17 gaps left
8. [x] copies: no merge of C++ nodes of one path, `CppCopyRules` picks the copy of the include closure, else the
   nearest (the parked patch)
9. [x] decision 6: a global declaration's path is its name (CppTargets and the body index go; the copy rules pick the file)
10. [x] TSE: `::N` (prefix segment `::`), template parameters and classes or aliases declared in a function hide (`CppLocalNames`)
11. [x] declarations: untagged typedef'd structs, typedef and `using` aliases (aliases are leaves; a typedef a macro
    breaks declares nothing). Checkpoint probe worse by decision 4: `cpp/r1-cpp1` (`Self -> app.Widget`, a member alias
    is a leaf of its own)
12. [x] `struct N *` is a use and declares `N` if none is visible. Checkpoint probe worse by decision 5: `c/r2-csrc`
    (`shape.h -> point.c`, the body of the struct `point.h` declares forward)
13. [x] implementation parts (`Node.isImplementationPart`, shared, approved by Christian 2026-10-26), out-of-line
    template members and specializations. Checkpoint probe worse by decision 3: `cpp/r3-p3-cpp` (`a/Foo.cpp -> a/Foo.h`)
14. [x] `SpeedType::WALKING` in an expression is a use of `SpeedType`
15. [x] changelog, README, gh-pages, the extractor's README, spec table (no gap left), FINDINGS of both samples, plan

## PHP (done, 2026-10-26)

Branch `fix/dependency-name-resolution-php`, cut from the pushed `-c-cpp`; comparison build of the first commit
`ccsh-cc29`. Christian: "do it like the compiler does it, else like the other languages". Ground truth: PHP 8.4.25
from php-wasm in the session scratchpad (`npm i --ignore-scripts @php-wasm/node@3.1.56`, runner `php.mjs`). Spec
`docs/name-resolution/php.md`, decisions 1–4 chosen by Christian on 2026-10-26: functions and constants are
declarations with PHP's global fallback; an include uses the included file's script leaf; include paths relative to
the including file; a class name counts in every place the compiler resolves one; 5, names match in their exact case
only (asked again after the prototype matched ignoring case and let `count()` mean a class `Count`). Decisions 6–9
derived (global namespace path, declarations in blocks, script leaf, docblocks).

1. [x] spec page
2. [x] probes: 46 under `sample-projects/regression/php/spec-*`, 32 gaps at the start; each runs in PHP 8.4 (tools
   `php/mkprobes.py` writes them, `php/check-probes.sh` runs `php/check.php` on each, `php/regen-gaps.py` rewrites
   known-gaps.md and the spec table from `scratch/pc-php/`)
3. [x] refactor: PHP gets name rules of its own (`PhpNameRules`), the default ones for now
4. [x] decision 5 changed to exact case (spec, probe `spec-exact-case`)
5. [x] TSE: namespace blocks; each declaration carries its block's namespace as parent path, imports per block
   (`NamespaceBlocks`, `PhpImports`); no output change
6. [x] TSE: every name read today carries the namespace it resolves to (`PhpNames`) as prefix; no output change
7. [x] the switch: declarations at namespace plus name (global: the name, decision 6), uses written as full paths,
   `PhpNameRules` exact; the old heuristics and import dependencies go
8. [x] functions and constants: calls and constant reads are uses with the global fallback; `define` with a namespace
9. [x] decision 4: every type position (nullable, union, intersection, variadic, promoted, closures, `catch`)
10. [x] decision 4: `instanceof`, attributes, `X::$property`
11. [x] decision 4: interface `extends`, enum `implements`, anonymous class headers
12. [x] decision 4: trait bodies; the names of a nested declaration are its own
13. [x] decision 8: top-level code is a script leaf at the file's path, also next to declarations
14. [x] decisions 2 and 3: an include uses the included file's script leaf (old include imports go)
15. [x] changelog, README, gh-pages, the extractor's README, spec table, FINDINGS, plan

### Resume after PHP here (2026-10-26)

- **Branch** `fix/dependency-name-resolution-php`, waiting for Christian's review and push; **last build** `ccsh-php11`
  (head before the docs commit), the next language's first chain is `chain.sh php11 <tag>`. No gap left in
  `regression/php/`. Checkpoint probes worse than the release: the twelve known (C, C++, C#, Go, Java, Python,
  TypeScript), no PHP one; the PHP ones and `mixed/r1-self2` are better.
- **How it is built:** TSE `NamespaceBlocks` (blocks and their statements), `PhpImports` (what the `use` declarations of
  a block bind, by kind, exact case), `PhpNames` (class path; function or constant path with the global fallback),
  `UsedTypeExtractor` (roles by grammar position, names inside nested declarations left to them), `ConstantReads`,
  `IncludePaths` (include as a use named `MODULE_SCRIPT`, path as prefix), `TopLevelCode` (script declaration),
  `DefineCalls`. Analyzer: `PhpAnalyzer` writes declarations at `parentPath + name`, the script leaf at the file's
  path, uses as full paths with fallbacks, includes relative to the file's folder; `PhpNameRules` exact.
- **Tools** in the tools folder `php/`: `mkprobes.py`, `check-probes.sh` + `check.php` (PHP 8.4 from php-wasm,
  `PHPWASM=<dir with php.mjs>`; the scratchpad one is gone with the session: `npm i --ignore-scripts
  @php-wasm/node@3.1.56` and the four-line `php.mjs` runner in the tools README of `php/`), `regen-gaps.py`.
- **Not supported:** names in strings and computed names, `class_alias`, docblock types, `composer.json` and
  `include_path`, files not analysed as PHP (`.phtml`), a name in another case than its declaration (decision 5).
- The prototype of steps 5–14 is still `git stash` "php-prototype"; it can be dropped.

Prototype of steps 5–14 (all probes but the case one green, no checkpoint probe worse, the sample gains the 24 file
edges FINDINGS expects): `git stash` "php-prototype", copy in the scratchpad `php-prototype.patch`.

## Rust (done, 2026-10-27)

Branch `fix/dependency-name-resolution-rust`, cut from the pushed `-php`; comparison build of the first commit
`ccsh-php11`. Christian: "do it like the compiler does it, else like the other languages". Ground truth: rustc 1.99.1
from `rustup-init --profile minimal` in the session scratchpad (`RUSTUP_HOME`/`CARGO_HOME` there; `cargo check` and
`rustc --emit=metadata` need no linker). Spec `docs/name-resolution/rust.md`, decisions 1–6 chosen by Christian on
2026-10-26: crate name from `Cargo.toml`; module tree from the `mod` declarations; an `impl` in another file is an
implementation part; every name the compiler resolves is a use (bodies, calls, constants, macros); macro arguments
read as expressions; `#[cfg(test)]` only with `--include-tests`. Decisions 7–15 derived (re-exports, items in bodies,
crates without dependency, method calls, variants, two crate roots, editions, impl for a library type, copies by crate).

1. [x] spec page
2. [x] probes: 62 under `sample-projects/regression/rust/spec-*`, 36 gaps at the start; each compiles with rustc 1.99
   except the two rustc rejects on purpose (tools `rust/mkprobes.py` writes them, `rust/check-probes.sh` compiles them,
   `rust/regen-gaps.py` rewrites known-gaps.md and the spec table from `scratch/pc-rust/`)
3. [x] refactor: Rust gets name rules of its own (`RustNameRules`), the default ones for now
4. [x] TSE: `TreeSitterDependencies.rustModule()` (Christian chose a Rust-only result type over markers in the shared
   types): `mod` lines, items with kind, visibility and variants, `use` bindings, `impl` headers, `extern crate`; types
   in `languages/rust/model` (a package of their own, the architecture test forbids `rust` <-> `rust.extractors`)
5. [x] crates from `Cargo.toml`, module tree from the `mod` declarations (decisions 1, 2, 12, 13), old lookup;
   `spec-reexport-chain` keeps an interim `extra` line until step 7 (Christian chose it over merging 5 and 7)
6. [x] TSE: the paths each item and `impl` writes, bodies included, local names hidden, macro arguments read
   (`PathCollector`, `LocalScopes`, `PatternBindings`, `MacroTokens`; a lower-case identifier pattern binds, an
   upper-case one is a path, by Rust's naming conventions)
7. [x] the switch: exact lookup (scopes, globs, crates, prelude, macros), re-export declarations (decisions 4, 5, 7, 8,
   10, 11, 16), `RustNameRules` exact; the heuristics and the re-export alias folding go. Checkpoint probes worse by
   decision: `rust/r2-rs1`, `r2-rs2` (`other::helper()` is a call, decision 4), `r3-p3-rust` (through the barrels,
   decisions 7 and 16)
8. [x] `impl` parts (decisions 3, 14), `RustCopyRules` (a declaration before an implementation part, else the nearest)
9. [x] `#[cfg(test)]` (decision 6); Christian chose to infer the flag (a run that analyses a Rust file in a test folder
   has tests) over a shared `FileInfo` field; `spec-cfg-test` got a `tests/smoke.rs`
10. [x] decision 15 changed to the nearest copy (Christian, 2026-10-27: the copy step cannot know the crate a use
    resolved in; no shared change); `spec-binary-copy` stays a known gap, Not supported
11. [x] changelog, README, gh-pages, the extractor's README, spec table, FINDINGS, plan

### Resume after Rust here (2026-10-27)

- **Branch** `fix/dependency-name-resolution-rust`, waiting for Christian's review and push; **last build** `ccsh-rs7`
  (head before the docs commits), the next language's first chain is `chain.sh rs7 <tag>`. One gap left in
  `regression/rust/` (`spec-binary-copy`, Not supported by decision 15). Checkpoint probes worse than the release: the
  twelve known plus three by decision (`rust/r2-rs1`, `r2-rs2` decision 4, `r3-p3-rust` decisions 7 and 16).
- **How it is built:** TSE `rustModule()` (`ModuleReader`, `PathCollector` with `LocalScopes`, `PatternBindings`,
  `MacroTokens`, `UseTree`, `TypePaths`; types in `languages/rust/model`). Analyzer: `CargoManifestReader`,
  `RustCrates` (crate roots and names as Cargo finds them), `RustModuleTree` (the `mod` tree, bindings per module,
  textual macros, test code), `RustLookup` + `ModuleBindings` (the lookup, `Meaning`), `RustAnalyzer` (items, impl
  parts, re-export leaves, exact paths), `RustNameRules` exact, `RustCopyRules` (a declaration before an impl part).
  The old Rust `analyze()` extractors stay in TSE for other consumers; the parser no longer calls them.
- **Tools** in the tools folder `rust/`: `mkprobes.py` (+ `no-compile.json`), `check-probes.sh` (rustc and cargo from
  `rustup-init --profile minimal` in the scratchpad, `RUST=<dir>`; the session's one is gone with the session),
  `regen-gaps.py`.
- **Not supported:** method calls and fields on values, `macro_rules!` bodies, proc macros, `#[cfg]` other than test,
  items `lib.rs` and `main.rs` both declare (decision 15), `--include-tests` over code without a test folder.
- The prototype is `git stash` "rust-prototype"; it can be dropped.

The prototype of steps 5–10 is `git stash` "rust-prototype" (copy `rust-prototype.patch` in the scratchpad): all
probes but `spec-binary-copy` green; decision 16 (a declaration naming itself through a barrel points at the
re-export, as Python and TypeScript) was asked after it.

## Delphi (in progress, 2026-10-27)

Branch `fix/dependency-name-resolution-delphi`, cut from the pushed `-rust`; comparison build of the first commit
`ccsh-rs7`. Christian: "do it like the compiler does it, else like the other languages". Ground truth: Free Pascal
3.2.2 in Delphi mode (`-Mdelphi`) from the Ubuntu packages `fp-compiler-3.2.2`, `fp-units-rtl-3.2.2` and
`binutils-aarch64-linux-gnu` (+ libs) unpacked with `dpkg -x` into the session scratchpad; it compiles, links and runs,
so a probe can print what a name meant. It lacks attributes and inline variables (Delphi 10.3+). Spec
`docs/name-resolution/delphi.md`, decisions 1–4 chosen by Christian on 2026-10-27: routines, constants and variables
are declarations; main code is a script leaf, a `uses` entry draws no edge; exact case stays (the lookup ignores case,
an edge needs the declared case); members hide unit names across units. Decisions 5–9 derived (member types, members
belong to their type, routine-local declarations, attribute suffix, no unit scope names).

1. [x] spec page
2. [x] probes: 38 under `sample-projects/regression/delphi/spec-*`, 29 gaps at the start; each compiles with FPC in
   Delphi mode except the three that use syntax FPC lacks (tools `delphi/mkprobes.py` writes them,
   `delphi/check-probes.py` compiles them, `delphi/run-probes.sh <tag>` runs them, `delphi/regen-gaps.py` rewrites
   known-gaps.md and the spec table from `scratch/pc-delphi/`)
3. [ ] refactor: Delphi gets name rules of its own (`DelphiNameRules`), the default ones for now
4. [ ] TSE: the unit structure (`delphiUnit()`): unit or program name, both `uses` lists, declarations with kind,
   section, members, bases; no output change
5. [ ] TSE: the names each declaration and script part writes, locals hidden; no output change
6. [ ] the switch: the lookup of the spec over all units of a run (`DelphiProject`), exact rules (decision 3)
7. [ ] decision 1: routines, constants, variables, every type kind
8. [ ] decision 2: script leaves
9. [ ] decision 4: members across units
10. [ ] changelog, README, gh-pages, the extractor's README, spec table, FINDINGS, plan

## Steps

- [x] Ask Christian which language comes next: C# (2026-10-22)
- [x] Next language: Go (left to Claude by Christian, 2026-10-22), done 2026-10-22
- [x] Next language: Python (left to Claude by Christian, 2026-10-23), done 2026-10-23
- [x] Next language: TypeScript, JavaScript, Vue and Angular templates (left to Claude by Christian, 2026-10-23), done
  2026-10-26
- [x] Next language: C and C++ (Christian, 2026-10-26), done 2026-10-26
- [x] Next language: PHP (by the order above, 2026-10-26), done 2026-10-26
- [x] Next language: Rust (by the order above, 2026-10-26), done 2026-10-27
- [ ] Next language: Delphi (by the order above, 2026-10-27)
- [ ] For each language: spec, probes, implementation commits, acceptance
