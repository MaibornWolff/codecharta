# Known gaps: Kotlin

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/kotlin.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once a
gap closes, and the closed lines are deleted here.

## spec-ambiguous-star

Two star imports that both declare the name are not ambiguous to the parser: the first one wins.

```text
extra file a/App.kt -> b/Config.kt
extra leaf a/App.kt#App -> b/Config.kt#Config
```

## spec-import-alias

With an import alias, the plain name still means the imported declaration instead of the own package's.

```text
missing file a/App.kt -> a/Config.kt
missing leaf a/App.kt#App -> a/Config.kt#Config
```

## spec-own-nested-class

A nested class of the own class does not shadow a declaration of the own package.

```text
missing leaf a/Outer.kt#Outer -> a/Outer.kt#Node
extra file a/Outer.kt -> a/Node.kt
extra leaf a/Outer.kt#Outer -> a/Node.kt#Node
```

## spec-private-top-level

A private top-level declaration is found from other files of its package.

```text
extra file a/Second.kt -> a/First.kt
extra leaf a/Second.kt#Second -> a/First.kt#Helper
```

## spec-qualified-by-imported-class

Outer.Node is taken for Outer: only the first segment of a qualified name is used.

```text
missing leaf a/App.kt#App -> b/Outer.kt#Node
extra leaf a/App.kt#App -> b/Outer.kt#Outer
```

