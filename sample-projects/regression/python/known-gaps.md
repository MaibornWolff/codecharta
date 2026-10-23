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

## spec-from-import-alias

A name imported under an alias is looked up by the name it imports, which the other import of `Creature` takes.

```text
missing file app/facade.py -> app/dto/creature.py
missing leaf app/facade.py#Facade -> app/dto/creature.py#Creature
```

## spec-function-local-import

An import inside a function binds its name for every declaration of the file.

```text
extra leaf app/use.py#second -> app/models.py#Model
```

## spec-nested-class

The `Order` of `Order.Line` still counts as a use of its own, besides the nested class it qualifies.

```text
extra leaf shop/invoice.py#Invoice -> shop/order.py#Order
```

## spec-reexport-alias

An `__init__.py` that imports a name under an alias makes no re-export leaf of it.

```text
missing file app/user.py -> pkg/__init__.py
missing file pkg/__init__.py -> pkg/mod.py
missing leaf app/user.py#User -> pkg/__init__.py#Bar
missing leaf pkg/__init__.py#Bar -> pkg/mod.py#Foo
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
