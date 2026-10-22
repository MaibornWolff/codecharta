# Name resolution: C#

Follows the C# language specification (ECMA-334), sections "Namespace and type names", "Namespaces" with its using
directives, "Partial declarations" and "Attribute specification". The rules shared by every language are in
[README.md](README.md).

## Declarations

- A top-level type (class, struct, record, interface, enum, delegate) has the logical path `Namespace.Name`, where
  `namespace A.B { }`, `namespace A { namespace B { } }` and the file-scoped `namespace A.B;` all mean `A.B`. A type
  outside any namespace lies in the global namespace: its path is `Name`.
- A nested type has the path of the type it is declared in plus its name: `Namespace.Outer.Nested`.
- A project is the folder of a `.csproj` file with everything below it, up to the next folder with a `.csproj`. With
  no `.csproj` among the analysed files, they all form one project.
- One project cannot declare a type twice, so a logical path that several files of one project declare is one partial
  type over those files; the `partial` keyword is not read. A name that means a path declared in several files points
  at every file of the nearest project that declares it: all parts of a partial type, or the one copy of that project.
  The nearest project is the using file's own when it declares the path, else the project of the nearest copy
  (shared rule 2, applied to projects instead of files).
- A `file` type (`file class Helper`) and every type nested in it can be named in its own file only, and there it
  hides every other type of its name.

## A simple name `N`

Looked up in this order; the first match wins:

1. A type parameter `N` of the enclosing method or type: no edge.
2. A nested type `N` of the type the name is written in, then of each enclosing type outwards, each including the
   nested types it inherits from its base types.
3. For each namespace the name is written in, from the innermost outwards and ending with the global namespace:
   1. A type `N` of that namespace, in any file of the project.
   2. Only where the name is written inside a declaration of that namespace (for the global namespace: the using
      directives at the top of the file, before any namespace): a using alias `using N = …;` of that declaration
      means its target, else a type `N` that a `using X;` of that declaration imports, or a type nested in a type
      that a `using static T;` of that declaration names. Two such types make the name ambiguous: no edge.
4. A library type, such as `String` through `using System;`: no edge.

So a using directive at the top of a file loses to a type of an enclosing namespace, and a using inside
`namespace A.B { }` wins over a type of `A`.

## A qualified name `Q.N`

- The first segment of `Q` is looked up by the simple-name rules as a type, a using alias or a namespace, where a
  namespace is found relative to every enclosing namespace first (`Domain.User` inside `namespace Shop` means
  `Shop.Domain.User` when that exists, else `Domain.User`).
- If it is a type, `Q.N` is the nested type `N` of that type, including inherited ones. If it is an alias, `Q` stands
  for the alias target. If it is a namespace, `Q.N` is exactly the type `N` of that namespace.
- `global::A.B` means `A.B` looked up from the global namespace only.
- The qualifying type is no dependency of its own: `Order.Line` depends on `Line` only.

## Base types

A type in the base list (`class Report : Document, IPrintable`) is a use of kind `inheritance`; when a class, record or
struct names a project interface there, the kind is `implementation`. The syntax cannot tell a base class from an
interface, so the kind follows from the declaration the name resolves to.

## Attributes

An attribute written `[Name]` means `Name` or `NameAttribute`, whichever is an attribute class: one that names
`Attribute` in its base list, directly or through a project class. Code that compiles has at most one of them, as
both being attribute classes is an error. With both in the project and neither recognisable as an attribute class,
`[Name]` means `NameAttribute`. The same name written as a type elsewhere (`Audited lastCheck;`) means only `Name`.

## Probes

Each rule is tested by a probe under `sample-projects/regression/csharp/`. "Gap" means the parser does not follow
the rule yet; `sample-projects/regression/csharp/known-gaps.md` says how it deviates.

| Rule | Probe | Today |
| --- | --- | --- |
| Declarations: the forms of a namespace declaration | `spec-file-scoped-namespace` | ok |
| Declarations: a file type | `spec-file-type` | ok |
| 1. type parameter | `spec-type-parameter` | ok |
| 2. nested type of the own type | `spec-own-nested-type` | ok |
| 2. nested type of an enclosing type | `spec-enclosing-nested-type` | ok |
| 2. inherited nested type | `spec-inherited-nested-type` | ok |
| 3.1 own namespace | `spec-own-namespace` | ok |
| 3.1 enclosing namespace | `spec-parent-namespace` | ok |
| 3.1 global namespace | `spec-global-namespace` | ok |
| 3.2 using directive | `spec-using-namespace` | ok |
| 3.2 using directive inside the namespace, for a nested type | `spec-namespace-using-in-nested-type` | ok |
| 3.2 two using directives: ambiguous | `spec-ambiguous-usings` | ok |
| 3.2 using alias of a type | `spec-alias-to-type` | ok |
| 3.2 a using alias imports no other name | `spec-alias-imports-no-other-name` | ok |
| 3.2 `using static` | `spec-using-static-nested-type` | ok |
| 3.1 and 3.2: own namespace over a using | `spec-namespace-beats-using` | ok |
| 3.1 and 3.2: enclosing namespace over a using at the top | `spec-outer-namespace-beats-top-using` | ok |
| 3.1 and 3.2: using inside a namespace over an enclosing namespace | `spec-inner-using-beats-outer-namespace` | ok |
| 4. library type | `spec-library-type` | ok |
| 3.1 and 4: own namespace over a library type | `spec-namespace-shadows-library` | ok |
| Qualified through a namespace | `spec-fully-qualified` | ok |
| Qualified through a namespace relative to the enclosing one | `spec-relative-namespace` | ok |
| Qualified through `global::` | `spec-global-qualifier` | ok |
| Qualified through an alias of a namespace | `spec-alias-to-namespace` | ok |
| Qualified through a type | `spec-qualified-through-type` | ok |
| Base types | `spec-base-list-kinds` | ok |
| Attributes: `NameAttribute` | `spec-attribute-suffix` | ok |
| Attributes: `Name` | `spec-attribute-plain-name` | ok |
| Attributes: both exist, the attribute class wins | `spec-attribute-both-exist` | ok |
| Attributes: both exist, a project base class makes `Name` the attribute class | `spec-attribute-base-decides` | ok |
| Attributes: the attribute and the same name as a field type | `spec-attribute-and-field` | ok |
| Decision 1, nested type is its own leaf | `spec-nested-type-own-leaf` | ok |
| Decision 2, every part of a partial type | `spec-partial-every-part` | ok |
| Decision 2, partial type of the nearest project | `spec-partial-nearest-project` | ok |
| Shared rule 1, name scope | `spec-name-scope` | ok |
| Shared rule 2, copies in two projects | `spec-copies-nearest` | ok |
| Decision 2, copies without a `.csproj` are parts of one project | `spec-copies-without-project` | ok |
| Shared rule 3, no match | `spec-no-using` | ok |
| Shared rule 4, self | `spec-self` | ok |

## Not supported

- `global using` and the implicit usings of an SDK project (`<ImplicitUsings>`): a `global using` counts for its own
  file only, like a using at the top of that file.
- Project references and assemblies: a type of any project is visible from every other, `internal` and
  `InternalsVisibleTo` are not checked. Projects only group the parts of partial types.
- Generic arity: `Result` and `Result<T>` share the logical path `Namespace.Result`, and the copies rule picks the file.
- A `private` or `protected` nested type counts as visible everywhere.
- Two declarations of one namespace in one file: the using directives of either count for the types of both.
- `extern alias` and an alias-qualified name `alias::N` other than `global::`.
- A member or variable that has the same name as a type (`Color Color`): the name means the type.
- Nested types inherited over more than one level, or by an enclosing type: rule 2 looks at the own type's direct
  base types only, as in Java.

## Decisions

1. A nested type is a leaf of its own below its outer type (`Namespace.Outer.Nested`), and only its own uses are its
   dependencies; the outer type does not take them over (decided 2026-10-22, as for Java and Kotlin).
2. Each part of a partial type is a leaf of its own file with its own uses; a use of the type points at every part
   file of the nearest project that declares it (decided 2026-10-22). Copies inside one project count as parts, as
   nothing else compiles, and without any `.csproj` the analysed files are one project (decided 2026-10-22).
3. `global using` is not supported (decided 2026-10-22).
4. A type's generic arity is not part of its logical path (decided 2026-10-22).
5. A base-list entry's kind follows from the declaration it resolves to, not from its name (decided 2026-10-22).
6. An attribute follows the compiler: it means the attribute class of `Name` and `NameAttribute`, else `NameAttribute`,
   never no edge (decided 2026-10-22).
