# Known gaps: Go

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/go.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once a
gap closes, and the closed lines are deleted here.

## spec-alias-import

A qualified name is looked up by its simple name, not through its import name.

```text
extra leaf app/app.go#use -> v2/models/user.go#User
```

## spec-build-tag-variants

go.mod is not read and the suffix match needs two segments, so `example.com/m/fs` finds no folder; a name declared in
several files would also mean the first of them only.

```text
missing file core/core.go -> fs/open_linux.go
missing file core/core.go -> fs/open_windows.go
missing leaf core/core.go#Use -> fs/open_linux.go#Open
missing leaf core/core.go#Use -> fs/open_windows.go#Open
```

## spec-dot-import

A dot import is read as a wildcard of its import path, whose segments are not the package's folder.

```text
missing file app/app.go -> gen/map.go
missing leaf app/app.go#Run -> gen/map.go#Map
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

## spec-import-hidden-by-local

A call through an import name is reported without its qualifier, so `util.New()` is the plain name `New`, which the
one-segment import cannot resolve.

```text
missing leaf app/app.go#Shadowed -> util/tool.go#New
```

## spec-library-import

The suffix match also runs for files of a module, so `github.com/google/uuid` reaches the folder `google/uuid`.

```text
extra file app/app.go -> google/uuid/uuid.go
extra leaf app/app.go#Run -> google/uuid/uuid.go#New
```

## spec-longest-module-path

go.mod is not read; the suffix match finds the folder `plugin/x`.

```text
missing file cmd/main.go -> ext/x/x.go
missing leaf cmd/main.go#main -> ext/x/x.go#X
extra file cmd/main.go -> plugin/x/x.go
extra leaf cmd/main.go#main -> plugin/x/x.go#X
```

## spec-module-path

go.mod is not read, and the suffix match needs two segments.

```text
missing file app/app.go -> util/util.go
missing leaf app/app.go#Run -> util/util.go#Helper
```

## spec-other-module

go.mod is not read, so the module path `example.com/dice` does not lead to `libs/dicebag`.

```text
missing file app/roll/roll.go -> libs/dicebag/bag.go
missing leaf app/roll/roll.go#Roll -> libs/dicebag/bag.go#Throw
```

## spec-package-clause-name

go.mod is not read, and the suffix match needs two segments, so the one-segment folders `go-yaml` and `mismatch-dir`
are not found.

```text
missing file app/app.go -> go-yaml/yaml.go
missing file app/app.go -> mismatch-dir/m.go
missing leaf app/app.go#Run -> go-yaml/yaml.go#Marshal
missing leaf app/app.go#Run -> mismatch-dir/m.go#Do
```

## spec-qualified-through-import

A call through an import name is reported without its qualifier, so `model.NewDice()` is the plain name `NewDice`,
which the one-segment import cannot resolve.

```text
missing file app/app.go -> model/dice.go
missing leaf app/app.go#Start -> model/dice.go#NewDice
```

## spec-vendor

vendor/ is not read, and the suffix match does not reach a folder below it.

```text
missing file app/app.go -> vendor/gopkg.in/yaml.v3/yaml.go
missing leaf app/app.go#Run -> vendor/gopkg.in/yaml.v3/yaml.go#Unmarshal
```
