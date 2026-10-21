# Known gaps: Java

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/java.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once a
gap closes, and the closed lines are deleted here.

## spec-ambiguous-on-demand

Two on-demand imports that both declare the name are not ambiguous to the parser: the first one wins.

```text
extra file a/App.java -> b/Config.java
extra leaf a/App.java#App -> b/Config.java#Config
```

