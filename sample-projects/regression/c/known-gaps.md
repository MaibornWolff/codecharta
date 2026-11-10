# Known gaps: C

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/cpp.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once a
gap closes, and the closed lines are deleted here.

## spec-test-links

A C function is no declaration, so a call (`cart_total(1)` in `main`) draws nothing, and a test of plain functions
links to no code.

```text
missing test test_cart.c -> src/cart.h
```
