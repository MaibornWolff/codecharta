# Name resolution: Delphi

Follows the Delphi Language Guide, chapters "Programs and Units" (unit structure, the `uses` clause, unit scope),
"Declarations and Statements" (scope and qualified identifiers), "Classes and Objects" (class members, nested types,
class helpers) and "Attributes (RTTI)"; every rule but the attribute and the inline variable was checked with Free
Pascal 3.2.2 in Delphi mode (`-Mdelphi`), which compiled each probe and printed what each name meant. Delphi resolves
every name at compile time from the units a file uses, so the parser can follow the compiler, except where only the
type of a value would tell. The rules shared by every language are in [README.md](README.md).

## Units and programs

- A unit (`unit Game.Model;`) is a namespace: its declarations have the unit name plus their own name as logical
  path, `Game.Model.TCreature`, whatever folder holds the file. The dots belong to the name; `Game` is no unit of its
  own.
- A unit has two halves. What its `interface` section declares, other units can name; what its `implementation`
  section declares, only the unit itself.
- A program (`program CellarsAndCentaurs;` in a `.dpr`) and a library (`library Plugin;`) are namespaces like a unit:
  their declarations have the program's name plus their own, `CellarsAndCentaurs.Configure`. Nothing else can use
  them.
- `uses A, B;` makes every name A and B declare in their `interface` sections visible without a qualifier. An entry
  names a unit, nothing else: it draws no edge of its own, and an entry nothing uses draws none (decision 2). A
  program's `uses A in 'src\A.pas'` names the unit `A`; the path is not read.

## Declarations

- Every type is a declaration (decision 1): a class, record, interface, enum, class or record helper, and an alias
  (`TEntity = TCreatureEntity`), a pointer type (`PTreasure = ^TTreasure`), a class reference (`TFormClass = class of
  TForm`), a procedural type, a set, an array or a subrange type. So are a free routine (procedure or function), a
  constant, a resource string, a variable and a thread variable declared at unit level (decision 1).
- A type declared inside a class or record (`TOuter.TInner`) is a declaration of its own, below its outer type:
  `Game.Model.TOuter.TInner`, as a Java member type.
- No declarations of their own: the fields, methods, properties and constants of a class or record, which belong to
  it; enum values, which belong to their enum (`ctMonstrosity` means `TCreatureType`); what a routine declares inside
  itself (local types, constants, variables, nested routines), which no other declaration can name: its names are uses
  of the routine around it.
- A forward declaration (`TCreature = class;`) and the full one are one declaration, as a routine's heading in the
  `interface` section and its body in the `implementation` section are. A class without a body
  (`EShort = class(Exception);`) is a declaration like any other.
- The uses of a declaration are the names the compiler resolves in it: every type, in the declaration and, for a class
  or record, in the bodies of its methods in the `implementation` section; calls of routines and reads of constants
  and variables; the type in `is`, `as`, a hard cast `TLair(X)`, `on E: EFail do`, `class of`, `^T`, a generic
  argument or constraint, an attribute, a class helper's `for`; names inside an anonymous method.
- The code outside every declaration is a script leaf (decision 2): a program's main block (`begin … end.`) and a
  unit's `initialization` and `finalization` sections are a leaf `<name>_script` below the program or unit, named by
  the last segment of its name: `Game.Bootstrap.Bootstrap_script`, `CellarsAndCentaurs.CellarsAndCentaurs_script`. A
  file without such code has no script leaf. No name can mean a script leaf.

## A simple name `N`

Delphi has one namespace for all of these: a name means a type, a routine, a constant or a variable, whatever the
place it stands in. `N` means the first of:

1. A local name: a parameter, `Result`, `Self`, a local constant, variable, type or nested routine, a `for` or inline
   variable, the variable of `on E: … do`, a generic parameter of the enclosing type or routine. No edge.
2. Inside a class or record, in its declaration and in the bodies of its methods (decision 4): a member of the class,
   then of its base class and so on up, as far as the project declares the ancestors, then of the enclosing class
   for a nested one. A member is no edge, but a member type is a declaration of its own: `TInner` inside `TChild`
   means `TBase.TInner` if `TChild` inherits it. A class helper also sees the members of the type it extends.
3. The own unit or program: what it declares in either section.
4. The units of the `uses` clauses, the last listed first. In the `implementation` section, and in the script leaf,
   the entries of the implementation `uses` come before those of the interface `uses`; in the `interface` section only
   the interface `uses` counts. A unit offers what its `interface` section declares.
5. `System` and every other library unit: no edge. They come last, so a project unit in `uses` that declares
   `Length` wins over `System.Length`.

The name then means the project declaration found, or none: a name a library unit declares draws no edge.

## A qualified name

- `U.N`, where `U` is the own unit or a unit in scope by rule 4, means `N` declared in `U`. With dotted unit names the
  longest prefix that names such a unit wins: `Game.Model.Extra.Who` means `Who` of `Game.Model.Extra`, not a member
  `Extra` of `Game.Model`.
- Otherwise the first segment is looked up as a simple name. If it means a type, the next segment is a nested type of
  it (`TOuter.TInner`, its own declaration) or any other member (`TCreature.Create`, `TCreatureType.ctMonstrosity`
  for a scoped enum, `TFacade.STANDARD_TYPE`), which means the type. If it means a variable, a constant or a routine,
  the rest is a member of a value: no further edge.

## Case

Delphi ignores case for every name. The lookup above follows the compiler and ignores case too, so `hp` as a local
variable hides a constant `HP`; but a name only draws an edge when it is written in its declared case, and a unit's
names only through a `uses` entry or qualifier written in the unit's declared case (decision 3): `tcreature` for
`TCreature` draws none, nor does anything of `uses game.model;` for `unit Game.Model;`.

## Attributes

`[Table('creatures')]` means `TableAttribute` if the scope offers it, else `Table`; `[TableAttribute]` means
`TableAttribute`. The arguments are expressions like any other.

## Which file

A unit that several files declare means the nearest copy (shared rule 2). Delphi takes the first one on the search
path, which the parser does not know.

## Probes

Each rule is tested by a probe under `sample-projects/regression/delphi/`; every probe compiles with Free Pascal 3.2.2
in Delphi mode, except those that use syntax it lacks (attributes, inline variables), which follow the Delphi Language
Guide. "Gap" means the parser does not follow the rule yet; `sample-projects/regression/delphi/known-gaps.md` says how
it deviates.

| Rule | Probe | Today |
| --- | --- | --- |

## Not supported

- Members of a value: `Creature.Attack` or `with Creature do Attack` means a member of whatever type `Creature` has,
  which only type inference would tell; `Attack` inside a `with` is looked up as if the `with` were not there.
- Members a library ancestor declares (`Caption` of `TForm`): rule 2 sees only project ancestors, so a project routine
  of the same name is taken instead.
- Unit scope names (`uses SpeedType;` for `de.sots.model.SpeedType` through the `.dproj` `DCC_Namespace`): an entry
  names the unit of exactly its name.
- A name written in another case than its declaration (decision 3).
- Include files (`{$I Rules.inc}`) and files not analysed as Delphi (`.dpk`, `.lpr`, `.pp`, `.inc`): their text and
  their declarations are unknown. Both branches of an `{$IFDEF}` count, as both are in the source.
- Declare before use: Pascal lets a name mean only what stands before it, so before the own unit declares `N`, `N`
  means a used unit's `N`; rule 3 takes the own `N` everywhere in the unit.
- Names in strings (`FindClass('TCreature')`, RTTI by name).

## Decisions

1. Every type, free routine, unit-level constant, resource string, variable and thread variable is a declaration, and
   a call or read of one is a use, as in Rust, PHP, Go, Python and TypeScript (decided 2026-10-27).
2. A program's main block and a unit's `initialization` and `finalization` sections are a script leaf
   `<name>_script`, as top-level code in PHP and TypeScript; a `uses` entry draws no edge of its own, not even to the
   script leaf of the unit it names (decided 2026-10-27).
3. A name draws an edge only when written in its declared case, as before and as PHP decision 5, although the
   compiler ignores case; the lookup ignores case, so a local name hides a declaration written in another case
   (decided 2026-10-27; the lookup part derived from the compiler).
4. Inside a class or record a member hides a name of the units, also a member inherited from a project ancestor in
   another unit, as the compiler does (decided 2026-10-27).
5. A member type is a declaration of its own below its outer type, as in Java, C# and C++ (derived 2026-10-27).
6. An enum value, a field, a method and a property belong to their type, as Rust's variants (rust.md decision 11)
   (derived 2026-10-27).
7. What a routine declares inside itself is no target, as Rust's items in bodies (rust.md decision 8) and Java's
   local classes (derived 2026-10-27).
8. `[Name]` means `NameAttribute` before `Name`, as in C# (derived from the Delphi Language Guide, 2026-10-27).
9. Unit scope names are not read, as Christian chose for the sample project's `uses SpeedType;` (derived from the
   triage of 2026-10-08).
