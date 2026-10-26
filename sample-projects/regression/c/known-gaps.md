# Known gaps: C

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/cpp.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once a
gap closes, and the closed lines are deleted here.

## spec-implicit-forward

TSE reports struct Roost with the path its implicit declaration has as fallback, which the analyzer does not take yet.

```text
missing file nest.h -> roost.h
missing leaf nest.h#Nest -> roost.h#Roost
```
