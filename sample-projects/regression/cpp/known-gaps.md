# Known gaps: C++

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/cpp.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once a
gap closes, and the closed lines are deleted here.

## spec-test-links

A free function is no declaration, so the types its body names (`Cart cart;` in `totals()`) draw nothing; a test
written as free functions or GoogleTest `TEST(…)` blocks links only through the classes it declares, as `MockPrice`.

```text
missing test test/cart_test.cpp -> src/cart.h
```
