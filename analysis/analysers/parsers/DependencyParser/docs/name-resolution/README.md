# Name resolution

How the dependency parser decides which declaration a name in the code means. One page per language says, in order,
where a written name is looked up; the first place that holds a declaration of that name wins. The probes under
`sample-projects/regression/<language>/` test each rule, and each page lists which probe covers which rule.

## What a page covers

- **In scope:** given a type or declaration name the extractor reports for a declaration (`Config`, `Outer.Nested`,
  `a.b.Config`), which project declaration it means, or that it means none (a library or standard type).
- **Out of scope:** which source constructs report a name at all (a cast, `instanceof`, a lambda parameter). That is
  extraction coverage, recorded per language in `sample-projects/<language>/FINDINGS.md`.

## Rules shared by every language

1. **Name scope.** A name only means declarations of a language that can refer to it by name: Java with Kotlin,
   TypeScript with JavaScript, Vue and Angular templates, C with C++; every other language alone.
2. **Copies.** A logical path that several files declare (two projects with the same package) means the copy in the
   file that shares the longest folder path with the using file, the first of equally near ones; SQL takes the latest
   migration. C# takes the first file until its rules are written: a partial class is one class over several files,
   which no single nearest file stands for.
3. **No match.** A name that no rule resolves to a project declaration draws no edge.
4. **Self.** A declaration that names itself draws no edge.
5. **Namespace view.** The namespace view has one node per logical path, so copies of one path in different projects
   share a node and its level; an edge between them can point upwards there. The folder view keeps the projects apart.
