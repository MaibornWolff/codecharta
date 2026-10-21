# Known gaps: Kotlin

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/kotlin.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once a
gap closes, and the closed lines are deleted here.

## spec-private-top-level

A private top-level declaration is found from other files of its package.

```text
extra file a/Second.kt -> a/First.kt
extra leaf a/Second.kt#Second -> a/First.kt#Helper
```

## spec-qualified-constructor-call

A constructor called through its class (`Outer.Node()`) also reports the class as a use, so the qualifier draws an edge of its own.

```text
extra leaf a/App.kt#App -> b/Outer.kt#Outer
```

## spec-extension-through-receiver

The receiver of a call through a class (`Node.build()`) is also reported as a use, so the qualifier draws an edge of its own, as in `spec-qualified-constructor-call`.

```text
extra file a/App.kt -> a/Node.kt
extra leaf a/App.kt#App -> a/Node.kt#Node
```
