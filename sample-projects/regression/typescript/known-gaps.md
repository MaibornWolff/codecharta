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

## spec-dynamic-import

The result of a dynamic import binds nothing: a name read from it is found only where it stands alone (`({ ReportComponent }) => ReportComponent`).

```text
missing file routes.ts -> admin.ts
missing file routes.ts -> stats.ts
missing leaf routes.ts#loadStats -> stats.ts#Stats
missing leaf routes.ts#routes -> admin.ts#AdminComponent
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

## spec-qualified-chain

`export * as ns` is read like `export *`, so `lib.ts` gets a re-export leaf for every name of the module.

```text
extra file lib.ts -> shapes.ts
extra leaf lib.ts#Circle -> shapes.ts#Circle
```

## spec-reexport-default

`export { default as B } from` makes a re-export leaf that does not point at the default export.

```text
missing file ui/index.ts -> ui/button.ts
missing leaf ui/index.ts#Button -> ui/button.ts#Button
```

## spec-script-top-level

Top-level code outside every declaration is no declaration, so what it names draws nothing.

```text
missing file main.ts -> app.ts
missing leaf main.ts#main.script -> app.ts#AppModule
```

## spec-side-effect-import

Top-level code outside every declaration is no declaration, and a side-effect import draws nothing.

```text
missing file main.ts -> polyfill.ts
missing file polyfill.ts -> registry.ts
missing leaf main.ts#main.script -> polyfill.ts#polyfill.script
missing leaf polyfill.ts#polyfill.script -> registry.ts#Registry
```
