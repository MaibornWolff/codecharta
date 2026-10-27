# Known gaps: Rust

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/rust.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once a
gap closes, and the closed lines are deleted here.

## spec-binary-copy

The binary's own Config has the same logical path as the library's; the copy rule picks the nearest, not the copy of the
crate the use resolved in (decision 15).

```text
missing leaf src/main.rs#run -> src/main.rs#Config
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
