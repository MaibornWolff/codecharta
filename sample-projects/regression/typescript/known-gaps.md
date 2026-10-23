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

## spec-default-anonymous

An anonymous default export is a re-export leaf `<file>_DEFAULT_EXPORT`, which a default import does not find.

```text
missing file config.ts -> port.ts
missing file user.ts -> anon.ts
missing file user.ts -> config.ts
missing leaf config.ts#default -> port.ts#Port
missing leaf user.ts#start -> anon.ts#default
missing leaf user.ts#start -> config.ts#default
```

## spec-default-identifier

`export default name` is a re-export leaf `<file>_DEFAULT_EXPORT` of its own, and a default import does not find the declaration behind it.

```text
extra leaf settings.ts#settings_DEFAULT_EXPORT -> settings.ts#settings
missing file user.ts -> settings.ts
missing leaf user.ts#debug -> settings.ts#settings
```

## spec-default-named

A default import binds no name: the local name `B` finds nothing.

```text
missing file user.ts -> base.ts
missing leaf user.ts#User -> base.ts#Base
```

## spec-dynamic-import

The result of a dynamic import binds nothing: a name read from it is found only where it stands alone (`({ ReportComponent }) => ReportComponent`).

```text
missing file routes.ts -> admin.ts
missing file routes.ts -> stats.ts
missing leaf routes.ts#loadStats -> stats.ts#Stats
missing leaf routes.ts#routes -> admin.ts#AdminComponent
```

## spec-export-local-alias

`export { A as B }` without `from` is not read.

```text
missing file use.ts -> service.ts
missing leaf use.ts#Use -> service.ts#Impl
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

## spec-jsx-tag

A lower-case JSX tag is reported as a name.

```text
extra leaf page.tsx#Page -> card.tsx#card
```

## spec-local-declaration

A class declared in a function does not hide the import of the same name.

```text
extra leaf use.ts#local -> model.ts#Model
```

## spec-namespace-import

Through a namespace import only names starting upper case are reported.

```text
missing leaf app.ts#App -> models/user.ts#create
```

## spec-namespace-member

A namespace is one leaf without members and without uses; `Shapes.Circle` is a use of `Shapes`.

```text
extra leaf draw.ts#draw -> geo.ts#Shapes
missing file geo.ts -> point.ts
missing leaf draw.ts#draw -> geo.ts#Circle
missing leaf geo.ts#Circle -> point.ts#Point
missing leaf geo.ts#Shapes -> point.ts#Point
missing leaf geo.ts#unit -> geo.ts#Shapes
```

## spec-package-json-types

A folder means its `index`; its `package.json` is not read.

```text
extra file app.ts -> vendor/chart/index.ts
extra leaf app.ts#show -> vendor/chart/index.ts#Chart
missing file app.ts -> vendor/chart/lib/chart.d.ts
missing leaf app.ts#show -> vendor/chart/lib/chart.d.ts#Chart
```

## spec-parameter-shadows-import

A parameter does not hide the import of the same name.

```text
extra leaf use.ts#shadowed -> model.ts#Model
```

## spec-qualified-chain

`export * as ns` is read like `export *`, so the chain ends at re-export leaves of `lib.ts`.

```text
extra file app.ts -> lib.ts
extra file lib.ts -> shapes.ts
extra leaf app.ts#draw -> lib.ts#Circle
extra leaf lib.ts#Circle -> shapes.ts#Circle
missing file app.ts -> shapes.ts
missing leaf app.ts#draw -> shapes.ts#Circle
```

## spec-reexport-default

`export { default as B } from` makes a re-export leaf that does not point at the default export.

```text
missing file ui/index.ts -> ui/button.ts
missing leaf ui/index.ts#Button -> ui/button.ts#Button
```

## spec-reexport-imported

An imported name that the file exports again is no re-export.

```text
missing file lib/index.ts -> lib/a.ts
missing file use.ts -> lib/index.ts
missing leaf lib/index.ts#A -> lib/a.ts#A
missing leaf use.ts#Use -> lib/index.ts#A
```

## spec-reexport-star

`export *` re-exports the default export of the module too.

```text
extra leaf models/index.ts#Base -> models/model.ts#Base
```

## spec-reexport-star-ambiguous

`export *` re-exports a name that two of them offer.

```text
extra file lib/index.ts -> lib/b.ts
extra leaf lib/index.ts#Model -> lib/a.ts#Model
extra leaf lib/index.ts#Model -> lib/b.ts#Model
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

## spec-type-parameter

A type parameter does not hide the import of the same name.

```text
extra leaf box.ts#Box -> model.ts#Model
```

## spec-variable-declaration

A name bound by destructuring is no declaration.

```text
missing leaf app.ts#start -> routes.ts#left
```

## spec-workspace-package

A bare specifier that no configuration maps is not looked up among the workspace packages.

```text
missing file apps/web/app.ts -> packages/core/index.ts
missing leaf apps/web/app.ts#App -> packages/core/index.ts#Store
```

## spec-workspace-subpath

A bare specifier that no configuration maps is not looked up among the workspace packages.

```text
missing file apps/web/app.ts -> packages/core/model.ts
missing leaf apps/web/app.ts#App -> packages/core/model.ts#Model
```
