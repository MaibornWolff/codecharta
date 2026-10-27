# Known gaps: Delphi

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/delphi.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once a
gap closes, and the closed lines are deleted here.

## spec-anonymous-method

A procedural type written `reference to` is no declaration today.

```text
missing leaf Game.Rules.pas#TRules -> Game.Rules.pas#TIdFactory
```

## spec-attribute

The attribute suffix rule is missing: `[Table]` means `Table` even when the scope offers `TableAttribute`.

```text
missing leaf Game.Entity.pas#TEntity -> Game.Mapping.pas#TableAttribute
extra leaf Game.Entity.pas#TEntity -> Game.Mapping.pas#Table
```

## spec-casts-handlers

The type of a hard cast without a member access and of an exception handler is not extracted.

```text
missing leaf Game.Rules.pas#TRules -> Game.Model.pas#EFail
missing leaf Game.Rules.pas#TRules -> Game.Model.pas#TLair
```

## spec-class-without-body

A class without a body (`EFail = class(TObject);`) is no declaration today.

```text
missing file Game.User.pas -> Game.Errors.pas
missing leaf Game.User.pas#TUser -> Game.Errors.pas#EFail
```

## spec-const-var

Constants, resource strings and variables are no declarations today (decision 1).

```text
missing file Game.Limits.pas -> Game.Model.pas
missing file Game.User.pas -> Game.Limits.pas
missing leaf Game.Limits.pas#Current -> Game.Model.pas#TCreature
missing leaf Game.Limits.pas#NoBoss -> Game.Model.pas#TCreature
missing leaf Game.User.pas#TUser -> Game.Limits.pas#Current
missing leaf Game.User.pas#TUser -> Game.Limits.pas#MaxHp
missing leaf Game.User.pas#TUser -> Game.Limits.pas#NoBoss
missing leaf Game.User.pas#TUser -> Game.Limits.pas#PerThread
missing leaf Game.User.pas#TUser -> Game.Limits.pas#SName
```

## spec-enclosing-class-member

Free routines and constants are no declarations today, so the use beside the enclosing member draws no edge.

```text
missing file Game.Model.pas -> Game.Util.pas
missing leaf Game.Model.pas#TInner -> Game.Util.pas#Other
```

## spec-exact-case

A free routine is no declaration today (decision 1).

```text
missing file Game.User.pas -> Game.Model.pas
missing leaf Game.User.pas#TUser -> Game.Model.pas#Spawn
```

## spec-generic-parameter

A generic parameter does not hide a unit type of the same name.

```text
extra leaf Game.Box.pas#TBox -> Game.Util.pas#T
```

## spec-helper-members

Free routines are no declarations today (decision 1).

```text
missing file Game.Helper.pas -> Game.Util.pas
missing leaf Game.Helper.pas#TCreatureHelper -> Game.Util.pas#Upper
```

## spec-implementation-uses-first

The first uses entry that declares a name wins today, and the implementation uses do not come first.

```text
missing file Game.User.pas -> Game.B.pas
missing leaf Game.User.pas#TUser -> Game.B.pas#TItem
```

## spec-inherited-member-hides

Free routines are no declarations today (decision 1).

```text
missing file Game.Child.pas -> Game.Util.pas
missing leaf Game.Child.pas#TChild -> Game.Util.pas#Other
```

## spec-inherited-member-type

Members inherited from another unit are not looked up: the uses entry wins.

```text
missing leaf Game.Child.pas#TChild -> Game.Base.pas#TInner
extra file Game.Child.pas -> Game.Util.pas
extra leaf Game.Child.pas#TChild -> Game.Util.pas#TInner
```

## spec-inline-variable

The declared type of an inline variable is not extracted, and variables are no declarations (decision 1).

```text
missing leaf Game.Arena.pas#TArena -> Game.Model.pas#TStat
missing leaf Game.Model.pas#Boss -> Game.Model.pas#TCreature
```

## spec-last-uses-wins

The first uses entry that declares a name wins today; the compiler takes the last.

```text
missing file Game.User.pas -> Game.B.pas
missing leaf Game.User.pas#TUser -> Game.B.pas#TItem
extra file Game.User.pas -> Game.A.pas
extra leaf Game.User.pas#TUser -> Game.A.pas#TItem
```

## spec-library-unit

Free routines are no declarations today (decision 1).

```text
missing file Game.User.pas -> Game.Text.pas
missing leaf Game.User.pas#TUser -> Game.Text.pas#Length
```

## spec-local-declarations

A record declared inside a routine becomes a declaration of its own.

```text
extra leaf Game.Arena.pas#TArena -> Game.Arena.pas#TLocal
extra leaf Game.Arena.pas#TLocal -> Game.Model.pas#TCreature
```

## spec-local-hides

Constants are no declarations today (decision 1).

```text
missing file Game.User.pas -> Game.Limits.pas
missing leaf Game.User.pas#Calc -> Game.Limits.pas#MaxHp
```

## spec-longest-unit-prefix

Constants are no declarations today (decision 1), and a unit-qualified name keeps only its last segment.

```text
missing file Game.User.pas -> Game.Model.Extra.pas
missing leaf Game.User.pas#Picked -> Game.Model.Extra.pas#Who
```

## spec-member-hides

Free routines are no declarations today (decision 1).

```text
missing file Game.Child.pas -> Game.Util.pas
missing leaf Game.Child.pas#TChild -> Game.Util.pas#Other
```

## spec-nested-type

A qualified `TOuter.TInner` keeps only its last segment, and the outer type takes the uses of its member type.

```text
missing file Game.User.pas -> Game.Model.pas
missing leaf Game.User.pas#TUser -> Game.Model.pas#TInner
extra leaf Game.Model.pas#TOuter -> Game.Base.pas#TStat
```

## spec-program

A program declares no type, so the file is dropped; there are no script leaves (decision 2) and no routine declarations
(decision 1).

```text
missing file Arena.dpr -> Game.Model.pas
missing leaf Arena.dpr#Arena_script -> Arena.dpr#Configure
missing leaf Arena.dpr#Arena_script -> Game.Model.pas#Spawn
missing leaf Arena.dpr#Configure -> Game.Model.pas#TCreature
missing leaf Game.Model.pas#Spawn -> Game.Model.pas#TCreature
```

## spec-routine

Free routines are no declarations today (decision 1).

```text
missing file Game.Centaur.pas -> Game.Dice.pas
missing file Game.Dice.pas -> Game.Model.pas
missing leaf Game.Centaur.pas#TCentaur -> Game.Dice.pas#RollD20
missing leaf Game.Dice.pas#RollD20 -> Game.Model.pas#TCreature
```

## spec-script-initialization

There are no script leaves today (decision 2).

```text
missing file Game.Bootstrap.pas -> Game.Util.pas
missing leaf Game.Bootstrap.pas#Bootstrap_script -> Game.Util.pas#Register
missing leaf Game.Bootstrap.pas#Bootstrap_script -> Game.Util.pas#Unregister
```

## spec-type-kinds

Aliases, pointer, class reference, procedural, set and array types are no declarations today (decision 1).

```text
missing file Game.Types.pas -> Game.Model.pas
missing file Game.User.pas -> Game.Types.pas
missing leaf Game.Types.pas#PCreature -> Game.Model.pas#TCreature
missing leaf Game.Types.pas#TColors -> Game.Model.pas#TColor
missing leaf Game.Types.pas#TCreatureClass -> Game.Model.pas#TCreature
missing leaf Game.Types.pas#TCreatureProc -> Game.Model.pas#TCreature
missing leaf Game.Types.pas#TCreatures -> Game.Model.pas#TCreature
missing leaf Game.Types.pas#TEntity -> Game.Model.pas#TCreature
missing leaf Game.User.pas#TUser -> Game.Types.pas#PCreature
missing leaf Game.User.pas#TUser -> Game.Types.pas#TColors
missing leaf Game.User.pas#TUser -> Game.Types.pas#TCreatureClass
missing leaf Game.User.pas#TUser -> Game.Types.pas#TCreatureProc
missing leaf Game.User.pas#TUser -> Game.Types.pas#TCreatures
missing leaf Game.User.pas#TUser -> Game.Types.pas#TEntity
```

## spec-type-member-access

Variables are no declarations today (decision 1).

```text
missing leaf Game.Model.pas#Boss -> Game.Model.pas#TCreature
missing leaf Game.User.pas#TUser -> Game.Model.pas#Boss
```

## spec-type-positions

Typed constants are no declarations today (decision 1).

```text
missing leaf Game.Arena.pas#NoName -> Game.Model.pas#TName
```

## spec-unit-qualified

A unit-qualified name keeps only its last segment, so both fields mean the first uses entry's `TCreature`.

```text
missing file Game.Facade.pas -> dto/Game.Dto.Creature.pas
missing leaf Game.Facade.pas#TFacade -> dto/Game.Dto.Creature.pas#TCreature
```

## spec-unused-uses

There are no script leaves today (decision 2).

```text
missing leaf Game.Model.pas#Model_script -> Game.Model.pas#Count
```

## spec-uses-in

A program declares no type, so the file is dropped (decision 2).

```text
missing file App.dpr -> src/Game.Model.pas
missing leaf App.dpr#App_script -> src/Game.Model.pas#TCreature
```
