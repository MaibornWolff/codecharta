# Known gaps: C#

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/csharp.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once a
gap closes, and the closed lines are deleted here.

## spec-alias-imports-no-other-name

A using alias is read as a using directive of its target, so the target's own name becomes visible.

```text
extra file a/App.cs -> b/Config.cs
extra leaf a/App.cs#App -> b/Config.cs#Config
```

## spec-alias-to-type

A using alias of a type draws no edge.

```text
missing file a/App.cs -> b/Config.cs
missing leaf a/App.cs#App -> b/Config.cs#Config
```

## spec-ambiguous-usings

Two using directives that both import the name are not ambiguous to the parser: the first one wins.

```text
extra file a/App.cs -> b/Config.cs
extra leaf a/App.cs#App -> b/Config.cs#Config
```

## spec-attribute-ambiguous

With both `Name` and `NameAttribute` existing, the parser draws an edge to each.

```text
extra file a/App.cs -> a/Audited.cs
extra file a/App.cs -> a/AuditedAttribute.cs
extra leaf a/App.cs#App -> a/Audited.cs#Audited
extra leaf a/App.cs#App -> a/AuditedAttribute.cs#AuditedAttribute
```

## spec-copies-nearest

C# takes the first declaring file, not the nearest one.

```text
missing file second/Checkout.cs -> second/Util.cs
missing leaf second/Checkout.cs#Checkout -> second/Util.cs#Util
extra file second/Checkout.cs -> first/Util.cs
extra leaf second/Checkout.cs#Checkout -> first/Util.cs#Util
```

## spec-file-type

A file type counts like any other type: every file of the namespace means the first copy.

```text
missing leaf a/Second.cs#Second -> a/Second.cs#Helper
extra file a/Second.cs -> a/First.cs
extra file a/Third.cs -> a/First.cs
extra leaf a/Second.cs#Second -> a/First.cs#Helper
extra leaf a/Third.cs#Third -> a/First.cs#Helper
```

## spec-global-qualifier

A name qualified with `global::` draws no edge.

```text
missing file a/App.cs -> settings/Config.cs
missing leaf a/App.cs#App -> settings/Config.cs#Config
```

## spec-inherited-nested-type

A nested type inherited from the base class does not shadow a type of the own namespace.

```text
missing leaf a/Report.cs#Report -> a/Document.cs#Section
extra file a/Report.cs -> a/Section.cs
extra leaf a/Report.cs#Report -> a/Section.cs#Section
```

## spec-outer-namespace-beats-top-using

A using directive at the top of the file wins over a type of an enclosing namespace.

```text
missing file a/b/App.cs -> a/Config.cs
missing leaf a/b/App.cs#App -> a/Config.cs#Config
extra file a/b/App.cs -> c/Config.cs
extra leaf a/b/App.cs#App -> c/Config.cs#Config
```

## spec-own-nested-type

A nested type of the own type does not shadow a type of the own namespace.

```text
missing leaf a/Order.cs#Order -> a/Order.cs#Line
extra file a/Order.cs -> a/Line.cs
extra leaf a/Order.cs#Order -> a/Line.cs#Line
```

## spec-parent-namespace

A type of an enclosing namespace is not found from a namespace below it.

```text
missing file a/b/App.cs -> a/Config.cs
missing leaf a/b/App.cs#App -> a/Config.cs#Config
```

## spec-partial-every-part

A use of a partial type points at one part file only.

```text
missing file a/Client.cs -> a/Facade.cs
missing leaf a/Client.cs#Client -> a/Facade.cs#Facade
```

## spec-partial-nearest-project

A use of a partial type points at the first part file, which lies in another project.

```text
missing file second/Checkout.cs -> second/Order.cs
missing file second/Checkout.cs -> second/generated/Order.g.cs
missing leaf second/Checkout.cs#Checkout -> second/Order.cs#Order
missing leaf second/Checkout.cs#Checkout -> second/generated/Order.g.cs#Order
extra file second/Checkout.cs -> first/Order.cs
extra leaf second/Checkout.cs#Checkout -> first/Order.cs#Order
```

## spec-relative-namespace

A namespace in a qualified name is looked up from the global namespace first.

```text
missing file a/App.cs -> a/settings/Config.cs
missing leaf a/App.cs#App -> a/settings/Config.cs#Config
extra file a/App.cs -> settings/Config.cs
extra leaf a/App.cs#App -> settings/Config.cs#Config
```
