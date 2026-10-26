# Known gaps: PHP

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/php.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once a
gap closes, and the closed lines are deleted here.

## spec-anonymous-class

The extractor reads `extends` and `implements` of a named class only.

```text
missing file Model/Arena.php -> Model/Base.php
missing file Model/Arena.php -> Model/Fightable.php
missing leaf Model/Arena.php#Arena -> Model/Base.php#Base
missing leaf Model/Arena.php#Arena -> Model/Fightable.php#Fightable
```

## spec-attribute

Attributes are not read.

```text
missing file App/Facade.php -> Ann/Cached.php
missing file App/Facade.php -> Ann/Transactional.php
missing leaf App/Facade.php#Facade -> Ann/Cached.php#Cached
missing leaf App/Facade.php#Facade -> Ann/Transactional.php#Transactional
```

## spec-case-insensitive

Names are compared with their case: `CREATURE` finds no `Creature`.

```text
missing file App/Den.php -> Model/Creature.php
missing leaf App/Den.php#Den -> Model/Creature.php#Creature usage=instantiation
```

## spec-catch-instanceof

`catch` and `instanceof` are not read.

```text
missing file App/Spotter.php -> Model/Centaur.php
missing file App/Spotter.php -> Model/NotFound.php
missing leaf App/Spotter.php#Spotter -> Model/Centaur.php#Centaur
missing leaf App/Spotter.php#Spotter -> Model/NotFound.php#NotFound
```

## spec-class-member-access

A static property `X::$count` is not read.

```text
missing file App/Herd.php -> Model/Counter.php
missing leaf App/Herd.php#Herd -> Model/Counter.php#Counter
```

## spec-constant-fully-qualified

A constant read is a use only through `use const`.

```text
missing file App/Cap.php -> lib/limits.php
missing leaf App/Cap.php#Cap -> lib/limits.php#MAX usage=constant_access
```

## spec-declaration-in-block

A function call is no use.

```text
missing file app/Page.php -> lib/polyfill.php
missing leaf app/Page.php#Page -> lib/polyfill.php#slug
```

## spec-define

A constant read is a use only through `use const`.

```text
missing file app/Cap.php -> lib/config.php
missing leaf app/Cap.php#Cap -> lib/config.php#LIMIT usage=constant_access
```

## spec-enum-implements

`implements` is read for classes only.

```text
missing file Model/Alignment.php -> Model/Describable.php
missing leaf Model/Alignment.php#Alignment -> Model/Describable.php#Describable usage=implementation
```

## spec-fully-qualified

A fully qualified name is not resolved: a fully qualified base class is left out, and the global class `\Logger` has its
file's path as logical path.

```text
missing file Feat/Log.php -> lib/Logger.php
missing file Feat/User.php -> Base/User.php
missing leaf Feat/Log.php#Log -> lib/Logger.php#Logger
missing leaf Feat/User.php#User -> Base/User.php#User usage=inheritance
```

## spec-function-global-fallback

A function call is no use.

```text
missing file App/Job.php -> lib/global.php
missing leaf App/Job.php#Job -> lib/global.php#helper
```

## spec-function-own-namespace-first

A function call is no use.

```text
missing file App/Job.php -> lib/app.php
missing leaf App/Job.php#Job -> lib/app.php#helper
```

## spec-function

A function call is no use.

```text
missing file app/Fight.php -> lib/dice.php
missing leaf app/Fight.php#Fight -> lib/dice.php#roll
```

## spec-global-namespace

A declaration outside every namespace has its file's path as logical path, so a name of the global namespace does not
find it.

```text
missing file main/Main.php -> lib/Util.php
missing leaf main/Main.php#Main -> lib/Util.php#Util
```

## spec-group-use

An alias inside a group import is not bound.

```text
missing file App/Herd.php -> Model/Speed.php
missing leaf App/Herd.php#Herd -> Model/Speed.php#Speed
```

## spec-import-alias

An alias is replaced by the plain name it stands for, which the heuristics look up in the nearest file.

```text
missing file App/Facade.php -> Dto/Creature.php
missing leaf App/Facade.php#Facade -> Dto/Creature.php#Creature
```

## spec-include-absolute

An include is no use of the included file's script leaf.

```text
missing file app/index.php -> lib/boot.php
missing leaf app/index.php#index_script -> lib/boot.php#boot_script
```

## spec-include-in-function

An include is no use of the included file's script leaf.

```text
missing file app/Loader.php -> plugins/plugin.php
missing leaf app/Loader.php#Loader -> plugins/plugin.php#plugin_script
```

## spec-include-paths

An include is no use of the included file's script leaf, and only a single-quoted path directly behind the keyword is
read.

```text
missing file app/index.php -> app/helpers.php
missing file app/index.php -> app/x/view.php
missing file app/index.php -> lib/boot.php
missing file app/index.php -> lib/env.php
missing leaf app/index.php#index_script -> app/helpers.php#helpers_script
missing leaf app/index.php#index_script -> app/x/view.php#view_script
missing leaf app/index.php#index_script -> lib/boot.php#boot_script
missing leaf app/index.php#index_script -> lib/env.php#env_script
```

## spec-include-script-leaf

An include is no use of the included file's script leaf.

```text
missing file app/index.php -> lib/boot.php
missing leaf app/index.php#index_script -> lib/boot.php#boot_script
```

## spec-interface-extends

`extends` is read for classes only.

```text
missing file Model/Boss.php -> Model/Describable.php
missing file Model/Boss.php -> Model/Fightable.php
missing leaf Model/Boss.php#Boss -> Model/Describable.php#Describable usage=inheritance
missing leaf Model/Boss.php#Boss -> Model/Fightable.php#Fightable usage=inheritance
```

## spec-namespace-blocks

A file has the namespace of its first block, and each import counts for every block.

```text
missing file lib/two.php -> Admin/Item.php
missing leaf lib/two.php#Panel -> Admin/Item.php#Item
extra leaf lib/two.php#Panel -> Model/Item.php#Item
```

## spec-namespace-constant

A constant read is a use only through `use const`.

```text
missing file app/Cap.php -> lib/limits.php
missing leaf app/Cap.php#Cap -> lib/limits.php#MAX usage=constant_access
```

## spec-namespace-keyword

A name `namespace\A` is not resolved.

```text
missing file App/Box.php -> x/Tool.php
missing leaf App/Box.php#Box -> x/Tool.php#Tool
```

## spec-qualified-function

A function call is no use.

```text
missing file App/Fight.php -> Dice/dice.php
missing leaf App/Fight.php#Fight -> Dice/dice.php#roll
```

## spec-qualified-relative

A qualified name is not resolved: its text is looked up by the heuristics.

```text
missing file App/Util.php -> x/Creature.php
missing leaf App/Util.php#Util -> x/Creature.php#Creature
```

## spec-qualified-through-import

A qualified name is not resolved: its text is looked up by the heuristics.

```text
missing file App/Util.php -> Domain/Model/Creature.php
missing leaf App/Util.php#Util -> Domain/Model/Creature.php#Creature
```

## spec-script-leaf

Top-level code is a script leaf only in a file without declarations.

```text
missing file app/boot.php -> Model/Config.php
missing leaf app/boot.php#boot_script -> Model/Config.php#Config usage=instantiation
```

## spec-self-parent-static

A fully qualified base class is left out.

```text
missing file Feat/Horse.php -> Base/Animal.php
missing leaf Feat/Horse.php#Horse -> Base/Animal.php#Animal usage=inheritance
```

## spec-trait

The body of a trait is not read, only its name.

```text
missing file Model/HasSpeed.php -> Model/Speed.php
missing leaf Model/HasSpeed.php#HasSpeed -> Model/Speed.php#Speed usage=return_value
```

## spec-type-positions

Nullable, union and intersection parameter types and variadic and promoted constructor parameters are not read.

```text
missing leaf App/Svc.php#Svc -> Model/types.php#A usage=argument
missing leaf App/Svc.php#Svc -> Model/types.php#B usage=argument
missing leaf App/Svc.php#Svc -> Model/types.php#C usage=argument
missing leaf App/Svc.php#Svc -> Model/types.php#D usage=argument
missing leaf App/Svc.php#Svc -> Model/types.php#E usage=argument
missing leaf App/Svc.php#Svc -> Model/types.php#F usage=argument
missing leaf App/Svc.php#Svc -> Model/types.php#G usage=argument
```

## spec-use-function

A function call is no use.

```text
missing file App/Fight.php -> Dice/dice.php
missing leaf App/Fight.php#Fight -> Dice/dice.php#roll
```
