# Known gaps: Rust

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/rust.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once a
gap closes, and the closed lines are deleted here.

## spec-binary-copy

Not supported (decision 15): the binary's own Config has the same logical path as the library's, and both uses mean the
nearest copy, not the copy of the crate the use resolved in.

```text
missing leaf src/main.rs#run -> src/main.rs#Config
```
