# Known gaps: Python

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/python.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once
a gap closes, and the closed lines are deleted here.

## spec-annotation-lazy

An explicit import wins over a declaration of the own module whatever the order.

```text
missing leaf app/tree.py#Tree -> app/tree.py#Node
extra file app/tree.py -> app/lib.py
extra leaf app/tree.py#Tree -> app/lib.py#Node
```

## spec-class-scope

A nested class is no declaration, so the class body's own `Inner` finds nothing.

```text
missing leaf app/outer.py#Outer -> app/outer.py#Inner
```

## spec-definition-after-import

An explicit import wins over a declaration of the own module whatever the order.

```text
missing leaf app/tree.py#grow -> app/tree.py#Node
extra file app/tree.py -> app/other.py
extra leaf app/tree.py#grow -> app/other.py#Node
```

## spec-definition-time

An explicit import wins over a declaration of the own module whatever the order, so the body's `Node` misses the own
class.

```text
missing leaf app/tree.py#Tree -> app/tree.py#Node
```

## spec-file-folder-root

A module path is looked up from the analysis root only, not from the importing file's folder.

```text
missing file scripts/run.py -> scripts/helper.py
missing leaf scripts/run.py#Run -> scripts/helper.py#Helper
```

## spec-from-import-alias

A name imported under an alias is looked up by the name it imports, which the other import of `Creature` takes.

```text
missing file app/facade.py -> app/dto/creature.py
missing leaf app/facade.py#Facade -> app/dto/creature.py#Creature
```

## spec-function-local-binding

The extractor reports the parameters and variables of a function as uses.

```text
extra leaf app/use.py#build -> app/models.py#Model
extra leaf app/use.py#rebuild -> app/models.py#Model
```

## spec-function-local-import

An import inside a function binds its name for every declaration of the file.

```text
extra leaf app/use.py#second -> app/models.py#Model
```

## spec-local-class

A class declared in a function does not hide the module's `Temp`.

```text
extra file app/factory.py -> app/temp.py
extra leaf app/factory.py#make -> app/temp.py#Temp
```

## spec-nearest-root

A module path is looked up from the analysis root only, so `app.models` means the top-level `app` from everywhere.

```text
missing file svc/app/x.py -> svc/app/models.py
missing file svc/runner.py -> svc/app/models.py
missing leaf svc/app/x.py#X -> svc/app/models.py#Model
missing leaf svc/runner.py#Runner -> svc/app/models.py#Model
extra file svc/app/x.py -> app/models.py
extra file svc/runner.py -> app/models.py
extra leaf svc/app/x.py#X -> app/models.py#Model
extra leaf svc/runner.py#Runner -> app/models.py#Model
```

## spec-nested-class

A nested class is no declaration: its uses count for the class around it, and `Order.Line` is a use of `Order`.

```text
missing leaf shop/invoice.py#Invoice -> shop/order.py#Line
missing leaf shop/order.py#Line -> shop/product.py#Product
extra leaf shop/invoice.py#Invoice -> shop/order.py#Order
extra leaf shop/order.py#Order -> shop/product.py#Product
```

## spec-package-over-module

Of the module `app/models.py` and the package `app/models/__init__.py`, the module comes first.

```text
missing file app/x.py -> app/models/__init__.py
missing leaf app/x.py#X -> app/models/__init__.py#Model
extra file app/x.py -> app/models.py
extra leaf app/x.py#X -> app/models.py#Model
```

## spec-package-root

A module path is looked up from the analysis root only, not from the folder above a top-level package.

```text
missing file proj/src/app/main.py -> proj/src/app/core.py
missing file proj/tests/test_main.py -> proj/src/app/main.py
missing leaf proj/src/app/main.py#Main -> proj/src/app/core.py#Foo
missing leaf proj/tests/test_main.py#test_main -> proj/src/app/main.py#Main
```

## spec-reexport-alias

An `__init__.py` that imports a name under an alias makes no re-export leaf of it.

```text
missing file app/user.py -> pkg/__init__.py
missing file pkg/__init__.py -> pkg/mod.py
missing leaf app/user.py#User -> pkg/__init__.py#Bar
missing leaf pkg/__init__.py#Bar -> pkg/mod.py#Foo
```

## spec-suffix-fallback

A module path is looked up from the analysis root only, without the fallback to the module it ends with.

```text
missing file svc/app/main.py -> svc/app/core.py
missing leaf svc/app/main.py#Main -> svc/app/core.py#Foo
```

## spec-wildcard-all

A wildcard import ignores `__all__`.

```text
extra leaf app/user.py#build -> app/models.py#Other
```

## spec-wildcard-last-wins

Of two wildcard imports that bind a name, the first one wins.

```text
missing file app/tree.py -> app/second.py
missing leaf app/tree.py#grow -> app/second.py#Node
extra file app/tree.py -> app/first.py
extra leaf app/tree.py#grow -> app/first.py#Node
```

## spec-wildcard-public-only

A wildcard import also binds the names starting with `_`.

```text
extra leaf app/user.py#build -> app/models.py#_Secret
```
