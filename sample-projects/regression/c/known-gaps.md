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
