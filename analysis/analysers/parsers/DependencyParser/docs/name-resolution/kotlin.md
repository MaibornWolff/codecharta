# Name resolution: Kotlin

Follows the Kotlin language specification: declarations, scopes and identifiers, packages and imports. The rules
shared by every language are in [README.md](README.md).

## Declarations

- A top-level class, interface, object, enum class, annotation class or type alias has the logical path
  `package.Name`; a top-level function or property has `package.name`.
- A nested or inner class, and a companion or nested object, has the path of the class it is declared in plus its
  name: `package.Outer.Nested`.
- A `private` top-level declaration is visible only in its own file, and so is everything declared inside it.
  `internal` counts as public, since modules are not known.
- A local class or function is no target: no other file can name it.

## A simple name `N`

Looked up in this order; the first match wins:

1. A type parameter `N` of the enclosing function or class: no edge.
2. A local declaration `N` in an enclosing block: no edge (see above).
3. A nested classifier `N` of the class the name is written in, then of each enclosing class outwards.
4. An explicit import `import p.N` names `p.N`; an import with an alias `import p.M as N` names `p.M`, and that file
   no longer names `p.M` as `M`.
5. A declaration `N` of the own package, in any file of the package; a `private` one only from its own file.
6. A star import `import p.*`. Two of them that both declare `N` make the name ambiguous: no edge.
7. A default import (`kotlin.*`, `kotlin.collections.*`, `kotlin.text.*` and the other default packages, and
   `java.lang.*` on the JVM): no edge.

## A qualified name `Q.N`

- If the first segment of `Q` resolves as a classifier by the simple-name rules, `Q.N` is the nested classifier `N`
  of it (`Outer.Nested`, `Builder.Step`).
- Otherwise `Q` is a package and `Q.N` is exactly the declaration `N` of that package (`com.ex.Config`).
- The qualifying class is no dependency of its own: `Outer.Nested` depends on `Nested` only.
- A type alias resolves to the alias declaration; the alias depends on the type it stands for.

## Kotlin and Java

Both compile to one class path, so a Kotlin name can mean a Java class and the other way round, by the same rules.

## Probes

Each rule is tested by a probe under `sample-projects/regression/kotlin/`. "Gap" means the parser does not follow
the rule yet; the probe's `known-gaps.txt` says how it deviates.

| Rule | Probe | Today |
| --- | --- | --- |
| Declarations: a top-level function | `spec-top-level-function` | ok |
| Declarations: a `private` top-level declaration | `spec-private-top-level` | gap |
| 1. type parameter | `spec-type-parameter` | gap |
| 2. local class | `spec-local-class` | gap |
| 3. nested class of the own class | `spec-own-nested-class` | gap |
| 4. explicit import over the own package | `spec-explicit-import-beats-package` | ok |
| 4. import alias | `spec-import-alias` | gap |
| 5. own package over a star import | `spec-package-beats-star` | ok |
| 6. star import | `spec-star-import` | ok |
| 6. two star imports: ambiguous | `spec-ambiguous-star` | gap |
| 7. default import | `spec-default-import` | ok |
| 5 and 7. own package over a default import | `spec-package-shadows-default` | ok |
| Qualified through a class | `spec-qualified-by-imported-class` | gap |
| Qualified through a package | `spec-fully-qualified` | ok |
| Type alias | `spec-type-alias` | ok |
| Kotlin and Java | `spec-uses-java` | ok |
| Shared rule 1, name scope | `spec-name-scope` | gap |
| Shared rule 4, self | `spec-self` | ok |

## Not supported

- Members of a companion object or object named by their simple name through the class (`Outer.CONSTANT` is a use of
  `Outer`, not of the constant).
- Extension functions resolved by their receiver type; an imported extension is an explicit import like any other.
- Overloads of one function name in several files of a package: each file declares a copy, and the copy rule picks
  one.

## Decisions

1. A nested class or object is a leaf of its own below its outer class (`package.Outer.Nested`), and only its own
   uses are its dependencies (decided 2026-10-21, as for Java).

## Open questions

1. Can a class name a nested classifier of its supertype by its simple name (rule 3)? To be checked against the
   compiler before it is a rule.
