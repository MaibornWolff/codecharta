# Known gaps: Go

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/go.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once a
gap closes, and the closed lines are deleted here.

## spec-build-tag-variants

A name declared in several files of one package means the first of them only.

```text
missing file core/core.go -> fs/open_windows.go
missing leaf core/core.go#Use -> fs/open_windows.go#Open
```

## spec-external-test-package

The external test package shares the package of its folder, so its `setup` means the one of `store.go`, and its
edge into `store` counts as one inside the package.

```text
missing leaf store/store_test.go#TestOpen -> store/store_test.go#setup
missing leaf store/store_test.go#setup -> store/store.go#Open
extra leaf store/store_test.go#TestOpen -> store/store.go#setup
extra leaf store/store_test.go#setup -> store/store.go#Open upward
```
