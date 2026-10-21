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

## spec-enclosing-member-type

The outer type takes over the uses of its member types.

```text
extra leaf a/Outer.java#Outer -> a/Outer.java#Second
```

## spec-library-member-type

A member type of a library type (Map.Entry) is taken for a project type of its simple name.

```text
extra file a/App.java -> a/Entry.java
extra leaf a/App.java#App -> a/Entry.java#Entry
```

## spec-member-type-own-leaf

Order.Line is taken for the top-level Line, and the outer type takes over the uses of its member type.

```text
missing file com/ex/Invoice.java -> com/ex/Order.java
missing leaf com/ex/Invoice.java#Invoice -> com/ex/Order.java#Line
extra leaf com/ex/Order.java#Order -> com/ex/Product.java#Product
```

## spec-own-member-type

A member type of the own type does not shadow a type of the own package.

```text
missing leaf a/Outer.java#Outer -> a/Outer.java#Node
extra file a/Outer.java -> a/Node.java
extra leaf a/Outer.java#Outer -> a/Node.java#Node
```

## spec-qualified-by-imported-type

Outer.Node through an imported type is taken for the Node of the own package.

```text
missing file a/App.java -> b/Outer.java
missing leaf a/App.java#App -> b/Outer.java#Node
extra file a/App.java -> a/Node.java
extra leaf a/App.java#App -> a/Node.java#Node
```

## spec-static-import-member-type

A static import of a member type is not followed: the Node of the own package wins.

```text
missing file a/App.java -> b/Outer.java
missing leaf a/App.java#App -> b/Outer.java#Node
extra file a/App.java -> a/Node.java
extra leaf a/App.java#App -> a/Node.java#Node
```

