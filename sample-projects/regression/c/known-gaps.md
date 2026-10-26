# Known gaps: C

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/cpp.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once a
gap closes, and the closed lines are deleted here.

## spec-forward-declaration

A tag reference `struct Creature *` in a field is not reported as a use.

```text
missing file fightable.h -> creature.h
missing leaf fightable.h#Fightable -> creature.h#Creature
```

## spec-forward-nearest

A tag reference `struct Roost *` in a field is not reported as a use.

```text
missing file a/nest.h -> a/roost.h
missing leaf a/nest.h#Nest -> a/roost.h#Roost
```

## spec-implicit-forward

A tag reference `struct Roost *` in a field is not reported as a use.

```text
missing file nest.h -> roost.h
missing leaf nest.h#Nest -> roost.h#Roost
```

## spec-include-closure

Includes do not limit what a name means: `Creature` is looked up in the whole project, and a header that includes
nothing still resolves it.

```text
missing file centaur.h -> model/creature.h
missing leaf centaur.h#Centaur -> model/creature.h#Creature
extra file centaur.h -> dto/creature.h
extra file wyvern.h -> dto/creature.h
extra leaf centaur.h#Centaur -> dto/creature.h#Creature
extra leaf wyvern.h#Wyvern -> dto/creature.h#Creature
```

## spec-include-relative

Includes do not limit what a name means: the nearest copy of `Creature` wins, not the included one.

```text
missing file app/centaur.h -> model/creature.h
missing leaf app/centaur.h#Centaur -> model/creature.h#Creature
extra file app/centaur.h -> app/model/creature.h
extra leaf app/centaur.h#Centaur -> app/model/creature.h#Creature
```

## spec-library-include

A name a system header declares (`FILE`) resolves to a project declaration of that name.

```text
extra file buffer.h -> other/file.h
extra leaf buffer.h#Buffer -> other/file.h#FILE
```

## spec-transitive-include

Includes are not followed: the nearest copy of `Leaf` wins, not the one the include chain reaches.

```text
missing file app/a.h -> lib/c.h
missing leaf app/a.h#A -> lib/c.h#Leaf
extra file app/a.h -> app/c.h
extra leaf app/a.h#A -> app/c.h#Leaf
```

## spec-typedef-alias

A typedef is no declaration.

```text
missing file room.h -> size.h
missing leaf room.h#Room -> size.h#Area
missing leaf room.h#Room -> size.h#Meters
missing leaf size.h#Area -> size.h#Size
```

## spec-typedef-untagged

An untagged struct that a typedef names is no declaration.

```text
missing file shape.h -> point.h
missing leaf shape.h#Shape -> point.h#Point
```
