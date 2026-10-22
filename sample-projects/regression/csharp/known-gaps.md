# Known gaps: C#

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/csharp.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once a
gap closes, and the closed lines are deleted here.

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

