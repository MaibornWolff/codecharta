# Known gaps: Python

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/python.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once
a gap closes, and the closed lines are deleted here.

## spec-wildcard-all

A wildcard import ignores `__all__`.

```text
extra leaf app/user.py#build -> app/models.py#Other
```

## spec-alternative-if

Of the bindings in the branches of one `if` statement, the last one in source order wins.

```text
missing file app/shell.py -> app/windows.py
missing leaf app/shell.py#Shell -> app/windows.py#Console
```

## spec-alternative-try

Of the bindings in the branches of one `try` statement, the last one in source order wins.

```text
missing file app/encounter.py -> app/dice.py
missing leaf app/encounter.py#surprise -> app/dice.py#roll
```
