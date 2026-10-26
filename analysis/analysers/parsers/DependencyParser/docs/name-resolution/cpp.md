# Name resolution: C and C++

Follows the C++ standard, sections "Name lookup" ([basic.lookup], unqualified and qualified lookup), "Namespaces"
([basic.namespace], using-directives and using-declarations), "Elaborated type specifiers" ([dcl.type.elab]) and
"Source file inclusion" ([cpp.include]); C, which the parser reads with the C++ grammar, is the special case of one
global namespace. The rules shared by every language are in [README.md](README.md).

## Declarations

- A class, struct, union or enum with a body, and an alias (`typedef T N;`, `using N = T;`), is a declaration; an
  alias uses what it names (decision 4). Functions, variables, enumerators and macros are no declarations (decision 4).
- Its logical path is the namespaces it is declared in plus the classes around it plus its name:
  `namespace game::model { class Creature { struct Stats {}; }; }` declares `game.model.Creature` and
  `game.model.Creature.Stats`. Outside every namespace it is its name alone, `Point` for `struct Point {}` in C
  (decision 6); an unnamed namespace adds no segment.
- A member type is a leaf of its own below its class, and only its own uses are its dependencies, as a Java member
  type.
- A struct, union or enum without a tag that a typedef names takes the typedef's name: `typedef struct { int x; }
  Point;` declares `Point`. A typedef of a tagged type with the same name (`typedef struct Size Size;`) declares nothing
  of its own; the name means the struct (decision 7).
- A forward declaration (`struct Creature;`, `class Creature;`) is no declaration: it makes the name visible and means
  the class of that path (decision 5). So does an elaborated type specifier that names no visible class
  (`struct Roost *held;`): it declares the class in the innermost namespace around it, as the compiler does. An
  unqualified `friend class Util;` declares `Util` in the innermost namespace around its class, whatever is visible.
- The member functions of a class defined outside it (`void Creature::hit() { … }`, also inside the namespace
  blocks of the class) form the implementation part of the class: a leaf with the class's path in their file, whose
  uses are the uses of these functions, and which uses the class (decision 3). Members defined in the file of the
  class body belong to the class's leaf. An explicit specialization `template <> class Repository<Centaur> { … }` and
  an out-of-line member of a template (`int Pool<T>::size()`) are implementation parts of the template `Repository`
  or `Pool`.
- A class or alias declared inside a function is no target: no other declaration can name it.

## Include paths

`#include "p"` means the first of these files that exists:

1. The file `p` relative to the folder of the including file.
2. The project file whose path ends with `p` in whole segments; of several, the one that shares the longest folder
   path with the including file, the first in path order of equally near ones (decision 2).
3. None: a library or system header, such as `<vector>` or `<stdio.h>`. Nothing it declares is a project declaration.

`#include <p>` skips step 1. A file of any extension can be included, a header without one (`<mylib/Widget>`) or a
fragment such as `.inc`, and its includes are followed; only C and C++ files declare anything (decision 13).

## Visibility

A file sees its own declarations and those of every file it includes, directly or through other included files: its
include closure (decision 1). A name never means a declaration outside it, except through a forward declaration or an
implementation part (decision 5). The compiler sees more in a header, whatever the files that include it pasted
before it; a header that relies on that draws no edge for the names it does not include itself.

## A simple name `N`

Looked up in this order; the first scope that holds a visible declaration `N` wins ([basic.lookup.unqual]):

1. A template parameter `N`, or a class or alias `N` declared in the enclosing function: no edge.
2. A member type `N` of the class the name is written in, then of each enclosing class outwards, each including the
   member types it inherits from its base classes. In the body of a member function defined outside its class
   (`void game::model::Creature::hit() { Dice d; }`), the class is the one the function belongs to.
3. A declaration `N` in the namespace the name is written in, then in each enclosing namespace outwards up to the
   global namespace; for an out-of-line member function, the namespaces around its class. In each of these:
   - a using-declaration `using a::N;` in that scope declares `N` there;
   - a using-directive `using namespace a;` makes the names of `a` count as declared in the innermost namespace that
     encloses both the directive and `a` (for `using namespace a;` inside `x::y`, in the global namespace, so
     `x::N` still wins over `a::N`); a namespace alias `namespace m = a::b;` names `a::b`.
   Two declarations of `N` that count for the same scope, such as from two using-directives, make the name ambiguous:
   no edge.
4. None: a library name (`std::string` through `using namespace std;`) or an unknown one: no edge.

In C, `struct N`, `union N`, `enum N` and a typedef name `N` are looked up in the same way, all in the global
namespace.

## A qualified name `Q::N`

- `::N` is the declaration `N` of the global namespace.
- The first segment of `Q` is looked up as a simple name, as a namespace, namespace alias or class; each further
  segment is looked up in what the previous one names, and `N` in what `Q` names: a member type of the class `Q`,
  including inherited ones, or a declaration of the namespace `Q`, including the names using-directives in `Q`
  make visible. In namespace `de::sots::application`, `domain::model::Creature` finds `domain` in `de::sots` and
  means `de.sots.domain.model.Creature`.
- The qualifying class is no dependency of its own: `Outer::Inner` depends on `Inner` only.
- A name below the deepest declaration it reaches that no declaration is (`SpeedType::WALKING`,
  `Creature::create()`) is a use of that declaration.

## Which file

A name that resolves to a logical path means:

1. the file in the include closure whose declaration has a body, the first in include order if several have one;
2. otherwise, when the closure holds only a forward declaration of the path, or the name is the class of an
   implementation part: the file with the body of that path anywhere in the project, the nearest by shared rule 2 if
   several have one (decision 5). An implementation part is never the target of another file's name; its class body
   is.

## C and C++

One name scope (shared rule 1): a C file and a C++ file see each other's declarations through their includes.

## Probes

Each rule is tested by a probe under `sample-projects/regression/c/` or `cpp/`; every probe compiles in clang
(zig 0.17), except the two whose rule is that the code does not. "Gap" means the parser does not follow the rule
yet; `known-gaps.md` of the probe's folder says how it deviates.

| Rule | Probe | Today |
| --- | --- | --- |
| Declarations: logical path through namespaces | `cpp/spec-own-namespace` | ok |
| Declarations: a member type is a leaf of its own | `cpp/spec-member-type` | ok |
| Declarations, decision 7: a typedef names an untagged struct | `c/spec-typedef-untagged` | ok |
| Declarations, decision 7: a typedef of the same name | `c/spec-typedef-same-name` | ok |
| Declarations, decision 4: a typedef alias | `c/spec-typedef-alias` | ok |
| Declarations, decision 4: a `using` alias | `cpp/spec-alias-using` | ok |
| Declarations: `struct N *` declares N | `c/spec-implicit-forward` | ok |
| Declarations, decision 3: implementation part | `cpp/spec-implementation-part` | ok |
| Declarations, decision 8: explicit specialization | `cpp/spec-template-specialization` | gap |
| Declarations, decision 8: out-of-line template member | `cpp/spec-template-out-of-line-member` | gap |
| Declarations: unnamed namespace | `cpp/spec-unnamed-namespace` | ok |
| Include paths 1: relative to the including file | `c/spec-include-relative` | ok |
| Include paths 2: path ending | `c/spec-include-path-suffix` | ok |
| Include paths 2, decisions 2 and 12: one segment, nearest | `c/spec-include-suffix-nearest` | ok |
| Include paths 3: system header | `c/spec-library-include` | ok |
| Visibility, decisions 1 and 6: include closure, copies | `c/spec-include-closure` | ok |
| Visibility: transitive includes | `c/spec-transitive-include` | ok |
| 1. template parameter | `cpp/spec-template-parameter` | ok |
| 1, decision 9: class declared in a function | `cpp/spec-local-type` | ok |
| 2. member type before the namespace | `cpp/spec-member-type` | ok |
| 2. member type of an enclosing class | `cpp/spec-enclosing-class-member-type` | ok |
| 2. inherited member type | `cpp/spec-inherited-member-type` | ok |
| 2 and 3. out-of-line member body | `cpp/spec-out-of-line-lookup` | ok |
| 3. own namespace | `cpp/spec-own-namespace` | ok |
| 3. enclosing namespace | `cpp/spec-enclosing-namespace` | ok |
| 3. inner namespace before the global one | `cpp/spec-inner-namespace-first` | ok |
| 3. using-declaration | `cpp/spec-using-declaration` | ok |
| 3. using-directive | `cpp/spec-using-directive` | ok |
| 3. using-directive placement | `cpp/spec-using-directive-placement` | ok |
| 3. two using-directives: ambiguous | `cpp/spec-ambiguous-using-directives` | ok |
| 3. namespace alias | `cpp/spec-namespace-alias` | ok |
| 4. library name | `cpp/spec-library-namespace` | ok |
| Qualified: first segment as a simple name | `cpp/spec-qualified-relative` | ok |
| Qualified: `::N` | `cpp/spec-qualified-global` | ok |
| Qualified, decision 10: the qualifying class is no dependency | `cpp/spec-qualified-member-type` | ok |
| Qualified: a member below a declaration | `cpp/spec-member-of-type` | gap |
| Which file 1, decision 6: the included copy | `cpp/spec-closure-over-nearest` | ok |
| Which file 2, decision 5: forward declaration, a cycle | `c/spec-forward-declaration` | ok |
| Which file 2, decision 5: forward declaration in a namespace | `cpp/spec-forward-declaration` | ok |
| Which file 2, decision 5: opaque pointer | `c/spec-opaque-pointer` | ok |
| Which file 2: nearest of several bodies | `c/spec-forward-nearest` | ok |
| Which file 1, decision 11: two bodies in one closure | none: does not compile | - |
| C and C++, shared rule 1 | `cpp/spec-uses-c` | ok |
| Shared rule 1, name scope | `c/spec-name-scope` | ok |
| Shared rule 1, name scope | `cpp/spec-name-scope` | ok |
| Shared rule 4, self | `c/spec-self` | ok |
| Shared rule 4, self | `cpp/spec-self` | ok |

## Not supported

- The build's include directories (`-I`, `compile_commands.json`, CMake): rule 2 of the include paths stands in.
- Preprocessor conditions: every `#include` and all code count, under `#if`, `#ifdef` and `#if 0` alike. Macros are
  not expanded; a type a macro writes is not seen, and a typedef a macro keeps the parser from reading
  (`typedef Foo *FooPtr DEPRECATED;`) declares nothing.
- Declaration order: a declaration later in the include closure, or later in the same file, counts as well.
- Declarations in files that are no C or C++ file, such as `.inc` fragments or headers without an extension.
- Argument-dependent lookup, dependent names in templates (`typename T::Value`), C++20 modules (`import`).

## Decisions

1. A name means only declarations in the include closure of its file, as the compiler sees them; a name found
   nowhere there draws no edge, even if the project declares it once (decided 2026-10-26).
2. An include path is looked up relative to the including file, then as the ending of a project file's path, the
   nearest first; the build's include directories are not read (decided 2026-10-26).
3. Member functions defined outside their class's file form an implementation part: a leaf of the class's path in
   that file, which uses the class; other files' names mean the class body (decided 2026-10-26).
4. Classes, structs, unions, enums and aliases are declarations; functions, variables and macros are not (decided
   2026-10-26).
5. A forward declaration means the class of that path wherever its body is, by shared rule 2 if several files have
   one (decided 2026-10-26).
6. A declaration in the global namespace has its name as logical path; two files that define it are copies of one
   path, told apart by the include closure (decided 2026-10-26).
7. A typedef gives an untagged struct, union or enum its name; a typedef of a tagged type of the same name declares
   nothing of its own (decided 2026-10-26).
8. An explicit specialization and an out-of-line member of a template are implementation parts of the template, by
   decision 3 (derived 2026-10-26).
9. A class or alias declared inside a function is no target, as in Java and Go (derived 2026-10-26).
10. The qualifying class of `Outer::Inner` is no dependency of its own, as in Java (derived 2026-10-26).
11. Two bodies of one path in one include closure, which the compiler rejects, resolve to the first in include order
    (derived 2026-10-26).
12. An include path matches a file path ending in one segment already (`"config.h"`), unlike Go and Python, as C code
    includes headers by bare file name through `-I` (derived 2026-10-26).
13. An include may name a file of any extension, and its includes are followed; declarations are read from C and C++
    files only, as the run analyses no other (derived 2026-10-26).
