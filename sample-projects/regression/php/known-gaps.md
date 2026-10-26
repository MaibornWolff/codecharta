# Known gaps: PHP

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/php.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once a
gap closes, and the closed lines are deleted here.

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

## spec-script-leaf

Top-level code is a script leaf only in a file without declarations.

```text
missing file app/boot.php -> Model/Config.php
missing leaf app/boot.php#boot_script -> Model/Config.php#Config usage=instantiation
```
