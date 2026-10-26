# Name resolution: PHP

Follows the PHP manual, "Namespaces" (name resolution rules, importing and aliasing, global fallback for functions
and constants) and "include"; every rule was checked in PHP 8.4. PHP resolves a name from the text of its file alone:
the compiler replaces each class name by its fully qualified name before anything runs, and only functions and
constants look at what is declared. Which file declares a name is decided at runtime by an autoloader, which the
parser does not read. The rules shared by every language are in [README.md](README.md).

## Declarations

- A class, interface, trait or enum, a function, a namespace constant (`const MAX = 3;` outside a class) and a
  constant `define('MAX', 3)` defines are declarations (decision 1). Methods, properties and class constants belong to
  their class.
- The logical path is the namespace the declaration stands in plus its name: `namespace Game\Model; class Creature {}`
  declares `Game.Model.Creature`. Outside every namespace it is the name alone, `Creature` (decision 6). A
  `define('Game\MAX', 3)` declares `Game.MAX`; the namespace the call stands in does not count.
- A declaration inside a function or an `if` is still one of its namespace, as PHP declares it there when the code
  runs (`if (!function_exists('slug')) { function slug() {} }`), unlike a Java local class (decision 7).
- An anonymous class (`new class extends Base {}`) is no target: no name can mean it. The names it writes are uses of
  the declaration around it, as a closure's are.
- Top-level code, every statement outside the declarations, `namespace`, `use` and `declare`, is a script leaf
  `<file>_script` of the file, as in TypeScript (decision 8). Inline HTML counts as top-level code unless it is only
  whitespace. A file without top-level code has no script leaf. As only an include, which names a file, reaches it,
  its logical path is the file's path below the analysis root, as a TypeScript module's: `src/boot.php` has
  `src.boot.boot_script`, whatever namespace the file declares.

## Namespace blocks

A file may hold several namespaces, one after the other (`namespace A; … namespace B; …`) or in braces
(`namespace A { … }`, `namespace { … }` for the global one). Each block has its own imports; a name is resolved with
the namespace and the imports of the block it stands in.

## Imports

- `use A\B;` binds `B` to `A\B` for class and namespace names, `use A\B as C;` binds `C`. A group
  `use A\{B, C\D as E};` binds each member below the prefix.
- `use function A\f;` and `use const A\MAX;` bind a function or constant name; `use function A\{f, g};` likewise.
- An import names a path, nothing else: it draws no edge of its own, and an import nothing uses draws none.

## A class name

Where a class, interface, trait or enum is named (decision 4: every type, `new`, `extends`, `implements`, trait
`use`, `catch`, `instanceof`, attribute, `X::class`, `X::CONST`, `X::method()`, `X::$property`), the name means:

1. `self` and `static`: the class around it, no edge (shared rule 4); `parent`: the base class of the class around it;
   in a trait, the class that uses the trait, no edge. The type keywords (`int`, `string`, `array`, `mixed`, `void`,
   `null`, `false`, `iterable`, `callable`, `object`, …) name no class.
2. A fully qualified name `\A\B`: exactly `A\B`.
3. `namespace\A\B`: the current namespace plus `A\B`.
4. A qualified name `A\B`: if `A` is bound by a class or namespace import of the block, that import's path plus `B`;
   otherwise the current namespace plus `A\B`.
5. An unqualified name `C`: the class import `C` of the block if there is one; otherwise the current namespace plus `C`.
   There is no fallback to the global namespace: in namespace `App`, `RuntimeException` means `App\RuntimeException`
   unless an import binds it.

The name then means the project declaration of exactly that path, or none: a library class (`\RuntimeException`,
`Psr\Log\LoggerInterface`) draws no edge. Class, interface, trait, enum, function and namespace names match ignoring
case, as PHP does (decision 5); a constant's own name matches exactly.

## A function or constant name

A call `f()` or a constant `MAX` means:

1. A fully qualified name `\A\f`: exactly `A\f`. `namespace\f`: the current namespace plus `f`.
2. A qualified name `A\f`: as a qualified class name (rule 4 above), through the class and namespace imports.
3. An unqualified name `f`: the function import `f` of the block (`use function`), or for a constant the constant
   import (`use const`); otherwise the current namespace's `f` if the project declares it, otherwise the global `f`
   (PHP's fallback, at runtime). `true`, `false` and `null` are no constants.

A name below a class (`Creature::create()`, `SpeedType::WALKING`) is a use of that class, by the class name rules.

## Includes

`include`, `include_once`, `require` and `require_once` run another file where they stand (decision 2):

- The path is a string literal, `__DIR__ . 'literal'` or `dirname(__FILE__) . 'literal'`. A relative path is taken
  relative to the folder of the including file, `.` and `..` included; a path that starts with `/` from the analysis
  root (decision 3). Any other expression (a variable, a constant, a function call) draws no edge.
- The include is a use of the included file's script leaf, by the declaration whose code holds it: the script leaf of
  the including file at the top level, the function or class around it otherwise. An included file without top-level
  code, or a path that names no analysed file, draws no edge. The classes and functions of the included file are
  reached through the names that use them, as anywhere else.

## Which file

A path that several files declare (two copies of a class, a polyfill) means the nearest copy (shared rule 2). The
autoloader configuration (`composer.json`) is not read.

## Probes

Each rule is tested by a probe under `sample-projects/regression/php/`; every probe runs in PHP 8.4, which confirmed
the expected meaning of each name. "Gap" means the parser does not follow the rule yet;
`sample-projects/regression/php/known-gaps.md` says how it deviates.

| Rule | Probe | Today |
| --- | --- | --- |

## Not supported

- Names in strings and computed names: `new $class`, `'App\Model\Creature'`, `call_user_func('slug')`,
  `class_exists('Foo')`, `class_alias()`.
- Types written in docblocks (`@var Speed`, `@param list<Creature>`, `@throws`): the compiler ignores them (decision
  9).
- The autoloader and `include_path`: which file declares a name is decided by the copy rule; an include path is never
  looked up in the include path or the working directory.
- Files the run does not analyse as PHP, such as `.phtml` templates or `.inc` fragments: an include of one draws no
  edge.

## Decisions

1. Functions and namespace constants are declarations; a call or a constant read is a use, with PHP's fallback from
   the current namespace to the global one, as Go, Python and TypeScript count functions (decided 2026-10-26).
2. An include is a use of the included file's script leaf, as a side-effect import in TypeScript; the included file's
   declarations are reached through their names (decided 2026-10-26).
3. A relative include path is taken from the folder of the including file; the working directory and `include_path`
   are unknown and not guessed (decided 2026-10-26).
4. A class name is a use in every place the compiler resolves one, including nullable, union and intersection types,
   promoted constructor parameters, variadic parameters, `catch`, `instanceof`, attributes, interface `extends`, enum
   `implements`, anonymous classes and trait bodies (decided 2026-10-26).
5. Names match ignoring case where PHP does: classes, interfaces, traits, enums, functions and namespaces; a
   constant's own name exactly (derived from the compiler, 2026-10-26).
6. A declaration in the global namespace has its name as logical path, as in C and C++ (derived from cpp.md decision
   6, 2026-10-26).
7. A declaration inside a function or block is one of its namespace, as PHP declares it there (derived from the
   compiler, 2026-10-26).
8. Top-level code is a script leaf `<file>_script`, also in a file with declarations, as in TypeScript (derived from
   typescript.md decision 3, 2026-10-26).
9. Docblock types draw no edge, as the compiler ignores them (derived from the compiler, 2026-10-26).
