# Known gaps: TypeScript

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/typescript.md`. In each block, `missing <line>` is
an expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails
once a gap closes, and the closed lines are deleted here.

## spec-import-type-expression

TSE reports no name for a member read on an `import()` call that is not awaited, the form an import type has.

```text
missing file limit.ts -> speed.ts
missing leaf limit.ts#Limit -> speed.ts#Speed
```
