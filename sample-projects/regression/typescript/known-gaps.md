# Known gaps: TypeScript

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/typescript.md`. In each block, `missing <line>` is
an expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails
once a gap closes, and the closed lines are deleted here.

## spec-reexport-default

`export { default as B } from` makes a re-export leaf that does not point at the default export.

```text
missing file ui/index.ts -> ui/button.ts
missing leaf ui/index.ts#Button -> ui/button.ts#Button
```
