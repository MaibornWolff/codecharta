# Known gaps: Java

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/java.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once a
gap closes, and the closed lines are deleted here.


## spec-member-type-of-copy

Rule 3 looks a member type of the own type up by its logical path only, so it also finds the nested class of another
copy of the own type (the android copy's private `ElementSet`), not the one the supertype of the own copy declares.
Closing it needs the files that declare each path in the name rules; kept as a gap (Christian, 2026-10-27).

```text
missing leaf guava/src/com/g/c/RegularImmutableMultiset.java#RegularImmutableMultiset -> guava/src/com/g/c/ImmutableMultiset.java#ElementSet
extra file guava/src/com/g/c/RegularImmutableMultiset.java -> android/guava/src/com/g/c/RegularImmutableMultiset.java
extra leaf guava/src/com/g/c/RegularImmutableMultiset.java#RegularImmutableMultiset -> android/guava/src/com/g/c/RegularImmutableMultiset.java#ElementSet
```
