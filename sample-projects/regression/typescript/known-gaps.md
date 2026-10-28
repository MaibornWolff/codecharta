# Known gaps: TypeScript

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/typescript.md`. In each block, `missing <line>` is
an expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails
once a gap closes, and the closed lines are deleted here.

## spec-global-namespace-runtime-member

Decision 16: `Intl.Collator` is the runtime's, as the project's global namespace `Intl` declares no `Collator`. The
parser cannot tell, because TSE reads the members of a namespace in `declare global` as hidden members, so every
`Intl.X` falls back to the namespace. Kept as a gap (Christian, 2026-10-27).

```text
extra leaf app/format.ts#sortNames -> types/intl.d.ts#Intl
```
