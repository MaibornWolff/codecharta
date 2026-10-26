# Known gaps: C++

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/cpp.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once a
gap closes, and the closed lines are deleted here.

## spec-member-of-type

`SpeedType::WALKING` in an initializer expression is not reported as a use.

```text
missing file mover.hpp -> speed.hpp
missing leaf mover.hpp#Mover -> speed.hpp#SpeedType
```
