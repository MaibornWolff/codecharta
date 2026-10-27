# Known gaps: Rust

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/rust.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once a
gap closes, and the closed lines are deleted here.

## spec-associated-function

Function bodies are not read (decision 4); a path to an associated function is no use yet.

```text
missing file src/spawn.rs -> src/creature.rs
missing leaf src/spawn.rs#spawn -> src/creature.rs#Creature
```

## spec-binary-copy

The binary's own Config has the same logical path as the library's; without the crate of the use the copy rule picks one
copy (decision 15).

```text
missing leaf src/main.rs#run -> src/main.rs#Config
```

## spec-body-types

Function bodies are not read (decision 4).

```text
missing file src/body.rs -> src/model.rs
missing leaf src/body.rs#body -> src/model.rs#Dice
missing leaf src/body.rs#body -> src/model.rs#Kind
missing leaf src/body.rs#body -> src/model.rs#Speed
```

## spec-const-static

Function bodies are not read, and a const or static read is no use yet (decision 4).

```text
missing file src/cap.rs -> src/limits.rs
missing leaf src/cap.rs#cap -> src/limits.rs#MAX
missing leaf src/cap.rs#cap -> src/limits.rs#NAME
```

## spec-dependency-rename

Cargo.toml dependency renames are not read.

```text
missing file crates/app/src/lib.rs -> crates/model/src/lib.rs
missing leaf crates/app/src/lib.rs#Arena -> crates/model/src/lib.rs#Creature
```

## spec-enum-variant

Function bodies are not read (decision 4, 11).

```text
missing file src/mover.rs -> src/speed_type.rs
missing leaf src/mover.rs#pace -> src/speed_type.rs#SpeedType
```

## spec-extern-crate-alias

extern crate aliases are not read.

```text
missing file crates/app/src/lib.rs -> crates/model/src/lib.rs
missing leaf crates/app/src/lib.rs#Arena -> crates/model/src/lib.rs#Creature
```

## spec-function

Function bodies are not read; a call is no use yet (decision 4).

```text
missing file src/fight.rs -> src/dice.rs
missing leaf src/fight.rs#attack -> src/dice.rs#roll_d20
```

## spec-generic-parameter

Generic parameters do not hide imported names.

```text
extra file src/user.rs -> src/model.rs
extra leaf src/user.rs#Holder -> src/model.rs#Creature
```

## spec-glob-ambiguous

A name two globs offer resolves to the first declaration found.

```text
extra file src/user.rs -> src/a.rs
extra leaf src/user.rs#Holder -> src/a.rs#Creature
```

## spec-glob-private

A glob import also binds items the importer cannot see.

```text
extra leaf src/user.rs#Holder -> src/a.rs#Option
```

## spec-identifier-pattern

Function bodies are not read; an identifier pattern is no use yet.

```text
missing file src/rule.rs -> src/limits.rs
missing leaf src/rule.rs#rule -> src/limits.rs#MAX
```

## spec-impl-part

An impl block in another file than its type folds onto no declaration (decision 3).

```text
missing file src/display.rs -> src/model/creature.rs
missing file src/display.rs -> src/model/speed.rs
missing leaf src/display.rs#Creature -> src/model/creature.rs#Creature
missing leaf src/display.rs#Creature -> src/model/speed.rs#Speed
```

## spec-impl-trait-for-foreign-type

An impl of a project trait for a library type folds onto no declaration (decision 14).

```text
missing file src/herd.rs -> src/creature.rs
missing file src/herd.rs -> src/fightable.rs
missing leaf src/herd.rs#Fightable -> src/creature.rs#Creature
missing leaf src/herd.rs#Fightable -> src/fightable.rs#Fightable
```

## spec-local-item

Function bodies are not read; the names of an item in a body are no uses of the function (decision 8).

```text
missing file src/fight.rs -> src/model.rs
missing leaf src/fight.rs#fight -> src/model.rs#Speed
```

## spec-macro-arguments

Function bodies and macro arguments are not read (decision 5).

```text
missing file src/check.rs -> src/model.rs
missing leaf src/check.rs#check -> src/model.rs#Creature
missing leaf src/check.rs#check -> src/model.rs#MAX
missing leaf src/check.rs#check -> src/model.rs#roll_d20
```

## spec-macro-export

Macro invocations are no uses; macro_export puts no macro at the crate root.

```text
missing file src/fight.rs -> src/dice.rs
missing leaf src/fight.rs#attack -> src/dice.rs#roll
```

## spec-macro-textual

Macro invocations are no uses; textual macro scope is not followed.

```text
missing file src/fight.rs -> src/lib.rs
missing leaf src/fight.rs#clamp -> src/lib.rs#clamp_roll
```

## spec-macro-use

Macro invocations are no uses.

```text
missing file src/report.rs -> src/macros.rs
missing leaf src/report.rs#count -> src/macros.rs#creature_count
```

## spec-private-use-through-super

A path through a use of the parent module is not followed.

```text
missing file src/app/child.rs -> src/model.rs
missing leaf src/app/child.rs#make -> src/model.rs#Creature
```

## spec-qualified-beats-import

A qualified path in a body is not read; the return type's qualified path loses to the imported simple name.

```text
missing file src/facade.rs -> src/dto.rs
missing leaf src/facade.rs#map -> src/dto.rs#Creature
```

## spec-reexport-chain

Re-export declarations are made at the crate root only, and the old re-export folding resolves the test crate's
demo::Creature through the re-export to the struct; the switch to the exact lookup closes this.

```text
missing file src/lib.rs -> src/model/mod.rs
missing file src/model/mod.rs -> src/model/creature.rs
missing file tests/arena.rs -> src/lib.rs
missing leaf src/lib.rs#Creature -> src/model/mod.rs#Creature
missing leaf src/model/mod.rs#Creature -> src/model/creature.rs#Creature
missing leaf tests/arena.rs#spawn -> src/lib.rs#Creature
extra file tests/arena.rs -> src/model/creature.rs
extra leaf tests/arena.rs#spawn -> src/model/creature.rs#Creature
```

## spec-reexport-crate-visible

A pub(crate) use outside the crate root makes no re-export declaration (decision 7).

```text
missing file src/arena.rs -> src/model/mod.rs
missing file src/model/mod.rs -> src/model/lair.rs
missing leaf src/arena.rs#Arena -> src/model/mod.rs#Lair
missing leaf src/model/mod.rs#Lair -> src/model/lair.rs#Lair
```

## spec-reexport-glob

A glob re-export makes no declarations (decision 7).

```text
missing file src/arena.rs -> src/model/mod.rs
missing file src/model/mod.rs -> src/model/creature.rs
missing leaf src/arena.rs#Arena -> src/model/mod.rs#Creature
missing leaf src/model/mod.rs#Creature -> src/model/creature.rs#Creature
missing leaf src/model/mod.rs#Speed -> src/model/creature.rs#Speed
```

## spec-reexport

A pub use outside the crate root makes no re-export declaration (decision 7).

```text
missing file src/arena.rs -> src/model/mod.rs
missing file src/model/mod.rs -> src/model/creature.rs
missing leaf src/arena.rs#Arena -> src/model/mod.rs#Creature
missing leaf src/model/mod.rs#Creature -> src/model/creature.rs#Creature
```

## spec-struct-literal

Function bodies are not read (decision 4).

```text
missing file src/dig.rs -> src/den.rs
missing leaf src/dig.rs#dig -> src/den.rs#Den
```

## spec-trait-path

Function bodies are not read (decision 4).

```text
missing file src/fight.rs -> src/creature.rs
missing file src/fight.rs -> src/fightable.rs
missing leaf src/fight.rs#first -> src/creature.rs#Creature
missing leaf src/fight.rs#first -> src/fightable.rs#Fightable
missing leaf src/fight.rs#second -> src/creature.rs#Creature
missing leaf src/fight.rs#second -> src/fightable.rs#Fightable
```

## spec-two-crate-roots

Function bodies are not read (decision 4).

```text
missing file src/main.rs -> src/shared.rs
missing leaf src/main.rs#main -> src/shared.rs#Thing
```

## spec-use-alias

A use alias is not followed: the aliased name resolves to nothing.

```text
missing file src/repo.rs -> src/model.rs
missing leaf src/repo.rs#Repo -> src/model.rs#CreatureEntity
```

## spec-use-in-block

Function bodies, and a use in them, are not read (decision 4).

```text
missing file src/spawn.rs -> src/model.rs
missing leaf src/spawn.rs#spawn -> src/model.rs#Creature
```
