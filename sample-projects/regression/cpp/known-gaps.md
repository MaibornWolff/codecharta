# Known gaps: C++

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/cpp.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once a
gap closes, and the closed lines are deleted here.

## spec-alias-using

An alias declaration `using Entity = CreatureEntity;` is no declaration.

```text
missing file repo.hpp -> entity.hpp
missing file user.hpp -> repo.hpp
missing leaf repo.hpp#Entity -> entity.hpp#CreatureEntity
missing leaf repo.hpp#Repo -> repo.hpp#Entity
missing leaf user.hpp#User -> repo.hpp#Entity
```

## spec-implementation-part

The implementation part names its own logical path, which the shared self rule drops.

```text
missing file Creature.cpp -> Creature.hpp
missing leaf Creature.cpp#Creature -> Creature.hpp#Creature
```

## spec-local-type

A class declared in a function is a declaration of the class around it, so `Node` finds it there.

```text
extra leaf user.hpp#User -> user.hpp#Node
```

## spec-member-of-type

`SpeedType::WALKING` in an initializer expression is not reported as a use.

```text
missing file mover.hpp -> speed.hpp
missing leaf mover.hpp#Mover -> speed.hpp#SpeedType
```

## spec-out-of-line-lookup

The implementation part names its own logical path, which the shared self rule drops.

```text
missing leaf Creature.cpp#Creature -> Creature.hpp#Creature
```

## spec-template-out-of-line-member

An out-of-line member of a template is a declaration named `Pool<T>`, not part of `Pool`, and does not use `Pool`.

```text
missing file pool_impl.hpp -> pool.hpp
missing leaf pool_impl.hpp#Pool -> counter.hpp#Counter
missing leaf pool_impl.hpp#Pool -> pool.hpp#Pool
extra leaf pool_impl.hpp#Pool<T> -> counter.hpp#Counter
```

## spec-template-parameter

A template parameter does not hide a project class of its name.

```text
extra file box.hpp -> creature.hpp
extra leaf box.hpp#Box -> creature.hpp#Creature
```

## spec-template-specialization

An explicit specialization is no declaration.

```text
missing file centaur_repository.hpp -> centaur.hpp
missing file centaur_repository.hpp -> repository.hpp
missing leaf centaur_repository.hpp#Repository -> centaur.hpp#Centaur
missing leaf centaur_repository.hpp#Repository -> repository.hpp#Repository
```

## spec-uses-c

An untagged struct that a typedef names is no declaration.

```text
missing file shape.hpp -> point.h
missing leaf shape.hpp#Shape -> point.h#Point
```
