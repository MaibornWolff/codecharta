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

## spec-ambiguous-using-directives

Two using-directives that both declare `Widget` are not ambiguous; the first wins.

```text
extra file app.hpp -> a.hpp
extra leaf app.hpp#Panel -> a.hpp#Widget
```

## spec-closure-over-nearest

Includes do not limit what a name means: the nearest copy of `game::Config` wins, not the included one.

```text
missing file app/app.hpp -> far/config.hpp
missing leaf app/app.hpp#App -> far/config.hpp#Config
extra file app/app.hpp -> app/config.hpp
extra leaf app/app.hpp#App -> app/config.hpp#Config
```

## spec-enclosing-namespace

A simple name is looked up in its own namespace only, not in the enclosing ones.

```text
missing file app.hpp -> config.hpp
missing leaf app.hpp#App -> config.hpp#Config
```

## spec-implementation-part

The out-of-line member functions and the class body are one declaration of the path, which the copy rule puts into one
of the two files; other files' names point at the `.cpp`, and the header draws no edge.

```text
missing file Creature.cpp -> Creature.hpp
missing file Creature.hpp -> Dice.hpp
missing file User.cpp -> Creature.hpp
missing leaf Creature.cpp#Creature -> Creature.hpp#Creature
missing leaf Creature.hpp#Creature -> Dice.hpp#Dice
missing leaf User.cpp#User -> Creature.hpp#Creature
extra file Creature.cpp -> Dice.hpp
extra file User.cpp -> Creature.cpp
extra leaf Creature.cpp#Creature -> Dice.hpp#Dice
extra leaf User.cpp#User -> Creature.cpp#Creature
```

## spec-inner-namespace-first

Enclosing namespaces are not searched: the global `Config` wins over `game::Config`.

```text
missing file app.hpp -> game/config.hpp
missing leaf app.hpp#App -> game/config.hpp#Config
extra file app.hpp -> global/config.hpp
extra leaf app.hpp#App -> global/config.hpp#Config
```

## spec-library-namespace

A library name (`std::string` through `using namespace std;`) resolves to a project declaration of that name.

```text
extra file herd.hpp -> other/string.hpp
extra leaf herd.hpp#Herd -> other/string.hpp#string
```

## spec-local-type

A class declared in a function hides nothing: `Node` resolves to the global one.

```text
extra file user.hpp -> node.hpp
extra leaf user.hpp#User -> node.hpp#Node
```

## spec-member-of-type

`SpeedType::WALKING` in an initializer expression is not reported as a use.

```text
missing file mover.hpp -> speed.hpp
missing leaf mover.hpp#Mover -> speed.hpp#SpeedType
```

## spec-namespace-alias

A namespace alias is not read: `m::Creature` is looked up by its simple name and finds the other copy.

```text
missing file app.hpp -> model/creature.hpp
missing leaf app.hpp#App -> model/creature.hpp#Creature
extra file app.hpp -> dto/creature.hpp
extra leaf app.hpp#App -> dto/creature.hpp#Creature
```

## spec-out-of-line-lookup

The body of a member function defined outside its class looks names up neither in the class nor in the class's
namespaces, and it does not use its class.

```text
missing file Creature.cpp -> Dice.hpp
missing leaf Creature.cpp#Creature -> Creature.hpp#Creature
missing leaf Creature.cpp#Creature -> Dice.hpp#Dice
extra file Creature.cpp -> Global.hpp
extra leaf Creature.cpp#Creature -> Global.hpp#Dice
```

## spec-qualified-global

`::Config` is looked up by its simple name, so the namespace's `Config` wins over the global one.

```text
missing file app.hpp -> config.hpp
missing leaf app.hpp#App -> config.hpp#Config
extra file app.hpp -> game/config.hpp
extra leaf app.hpp#App -> game/config.hpp#Config
```

## spec-qualified-relative

The first segment of a qualified name is not looked up from the enclosing namespaces: `domain::model::Creature` finds
the other `Creature`.

```text
missing file application/inspector.hpp -> domain/model/creature.hpp
missing leaf application/inspector.hpp#Inspector -> domain/model/creature.hpp#Creature
extra file application/inspector.hpp -> application/dto/creature.hpp
extra leaf application/inspector.hpp#Inspector -> application/dto/creature.hpp#Creature
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

## spec-using-directive-placement

The names of a using-directive count before those of the enclosing namespace.

```text
missing file y.hpp -> x.hpp
missing leaf y.hpp#U -> x.hpp#N
extra file y.hpp -> a.hpp
extra leaf y.hpp#U -> a.hpp#N
```
