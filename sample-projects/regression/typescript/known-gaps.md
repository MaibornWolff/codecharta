# Known gaps: TypeScript

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/typescript.md`. In each block, `missing <line>` is
an expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails
once a gap closes, and the closed lines are deleted here.

## spec-declare-global

A declaration inside `declare global` is no declaration, and a name that no import binds is not looked up among the globals.

```text
missing file app.ts -> setup.ts
missing leaf app.ts#isDebug -> setup.ts#Settings
```

## spec-global-alternatives

A name that no import binds is not looked up among the declarations of script files.

```text
missing file app.ts -> types/a.d.ts
missing file app.ts -> types/b.d.ts
missing leaf app.ts#sum -> types/a.d.ts#Registry
missing leaf app.ts#sum -> types/b.d.ts#Registry
```

## spec-global-script

A name that no import binds is not looked up among the declarations of script files.

```text
missing file app.ts -> types/globals.d.ts
missing leaf app.ts#info -> types/globals.d.ts#Registry
missing leaf app.ts#info -> types/globals.d.ts#VERSION
```

## spec-reexport-default

`export { default as B } from` makes a re-export leaf that does not point at the default export.

```text
missing file ui/index.ts -> ui/button.ts
missing leaf ui/index.ts#Button -> ui/button.ts#Button
```
