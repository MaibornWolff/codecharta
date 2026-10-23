# Known gaps: JavaScript

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/typescript.md`. In each block, `missing <line>` is
an expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails
once a gap closes, and the closed lines are deleted here.

## spec-commonjs-default

A required module bound to a name is a variable leaf of the requiring file, and a use of the name points there.

```text
extra leaf b.js#make -> b.js#Service
missing file b.js -> svc.js
missing leaf b.js#make -> svc.js#Svc
```

## spec-commonjs-require-module

A required module bound to a name is a variable leaf of the requiring file, and a use of the name points there.

```text
extra leaf b.js#run -> b.js#a
missing file b.js -> a.js
missing leaf b.js#run -> a.js#Svc
missing leaf b.js#run -> a.js#helper
```

## spec-esm-import-commonjs

`module.exports = X` is no default export.

```text
missing file app.mjs -> svc.cjs
missing leaf app.mjs#make -> svc.cjs#Svc
```

## spec-js-default-named

A default import does not find the default export of its module.

```text
missing file b.js -> use.js
missing leaf b.js#make -> use.js#Use
```

## spec-require-side-effect

Top-level code outside every declaration is no declaration, and a `require` whose result is not bound draws nothing.

```text
missing file main.js -> setup.js
missing file setup.js -> registry.js
missing leaf main.js#main.script -> setup.js#setup.script
missing leaf setup.js#setup.script -> registry.js#register
```

## spec-script-global

A name that no import binds is not looked up among the declarations of script files.

```text
missing file legacy/page.js -> legacy/helpers.js
missing leaf legacy/page.js#render -> legacy/helpers.js#legacyHelper
```
