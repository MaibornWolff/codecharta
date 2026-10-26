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

## spec-catch-instanceof

`instanceof` is not read.

```text
missing file App/Spotter.php -> Model/Centaur.php
missing leaf App/Spotter.php#Spotter -> Model/Centaur.php#Centaur
```

## spec-class-member-access

A static property `X::$count` is not read.

```text
missing file App/Herd.php -> Model/Counter.php
missing leaf App/Herd.php#Herd -> Model/Counter.php#Counter
```

## spec-enum-implements

`implements` is read for classes only.

```text
missing file Model/Alignment.php -> Model/Describable.php
missing leaf Model/Alignment.php#Alignment -> Model/Describable.php#Describable usage=implementation
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

## spec-script-leaf

Top-level code is a script leaf only in a file without declarations.

```text
missing file app/boot.php -> Model/Config.php
missing leaf app/boot.php#boot_script -> Model/Config.php#Config usage=instantiation
```

## spec-trait

The body of a trait is not read, only its name.

```text
missing file Model/HasSpeed.php -> Model/Speed.php
missing leaf Model/HasSpeed.php#HasSpeed -> Model/Speed.php#Speed usage=return_value
```
