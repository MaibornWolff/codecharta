# Name resolution: Java

Follows the Java Language Specification: scope and shadowing (§6.4), meaning of names (§6.5), imports (§7.5). The
rules shared by every language are in [README.md](README.md).

## Declarations

- A top-level type (class, interface, enum, record, annotation) has the logical path `package.Name`.
- A member type has the path of the type it is declared in plus its name: `package.Outer.Nested`.
- A local or anonymous class is no target: no other file can name it.

## A simple name `N`

Looked up in this order; the first match wins (§6.4.1, §7.5):

1. A type parameter `N` of the enclosing method or type: no edge.
2. A local class `N` declared earlier in an enclosing block: no edge (see above).
3. A member type `N` of the type the name is written in, then of each enclosing type outwards, each including the
   member types it inherits from its supertypes.
4. A single-type import `import p.N;` or single static import of a member type `import static p.T.N;`: that type, in
   the project or outside it.
5. A type `N` of the own package, in any file of the package.
6. A type-import-on-demand `import p.*;` or static on-demand import `import static p.T.*;`. Two of them that both
   declare `N` make the name ambiguous: no edge.
7. `java.lang.N`, imported implicitly: no edge.

## A qualified name `Q.N`

- If the first segment of `Q` resolves as a type by the simple-name rules, `Q.N` is the member type `N` of that type,
  including inherited ones (`Map.Entry`, `Outer.Nested`).
- Otherwise `Q` is a package and `Q.N` is exactly the type `N` of that package (`com.ex.Config`).
- The qualifying type is no dependency of its own: `Order.Line` depends on `Line` only.

## Java and Kotlin

Both compile to one class path, so a Java name can mean a Kotlin class and the other way round, by the same rules.

## Probes

Each rule is tested by a probe under `sample-projects/regression/java/`. "Gap" means the parser does not follow
the rule yet; `sample-projects/regression/java/known-gaps.md` says how it deviates.

| Rule | Probe | Today |
| --- | --- | --- |
| Declarations: a member type is a leaf of its own | `spec-member-type-own-leaf` | gap |
| 1. type parameter | `spec-type-parameter` | gap |
| 2. local class | `spec-local-class` | gap |
| 3. member type of the own type | `spec-own-member-type` | gap |
| 3. member type of an enclosing type | `spec-enclosing-member-type` | gap |
| 3. inherited member type | `spec-inherited-member-type` | ok |
| 4. single-type import over the own package | `spec-single-import-beats-package` | ok |
| 4. single static import of a member type | `spec-static-import-member-type` | gap |
| 5. own package over an on-demand import | `spec-package-beats-on-demand` | ok |
| 6. on-demand import | `spec-on-demand-import` | ok |
| 6. two on-demand imports: ambiguous | `spec-ambiguous-on-demand` | gap |
| 7. `java.lang` | `spec-java-lang` | ok |
| 5 and 7. own package over `java.lang` | `spec-package-shadows-java-lang` | ok |
| Qualified through a type | `spec-qualified-by-imported-type` | gap |
| Qualified through a package | `spec-fully-qualified` | ok |
| Qualified through a library type | `spec-library-member-type` | gap |
| Java and Kotlin | `spec-uses-kotlin` | ok |
| Shared rule 1, name scope | `spec-name-scope` | gap |
| Shared rule 2, copies | `r1-mono` | ok |
| Shared rule 4, self | `spec-self` | ok |

## Not supported

- A variable that obscures a type or package of the same name (§6.4.2).
- Module boundaries (`module-info.java`): every exported or not exported package counts as visible.
- Kotlin top-level functions seen from Java through their file facade (`UtilsKt.helper()`).

## Decisions

1. A member type is a leaf of its own below its outer type (`package.Outer.Nested`), and only its own uses are its
   dependencies; the outer type does not take them over (decided 2026-10-21).
2. Two projects that declare the same package share one namespace node (shared rule 5, decided 2026-10-21).
