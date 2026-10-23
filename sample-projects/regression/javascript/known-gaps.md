# Known gaps: JavaScript

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/typescript.md`. In each block, `missing <line>` is
an expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails
once a gap closes, and the closed lines are deleted here.

## spec-commonjs-default

A name `require` binds does not name the required module or its default export.

```text
missing file b.js -> svc.js
missing leaf b.js#make -> svc.js#Svc
```

## spec-commonjs-require-module

A name `require` binds does not name the required module or its default export.

```text
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
