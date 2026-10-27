# Known gaps: Delphi

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/delphi.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once a
gap closes, and the closed lines are deleted here.

## spec-program

There are no script leaves today (decision 2).

```text
missing leaf Arena.dpr#Arena_script -> Arena.dpr#Configure
missing leaf Arena.dpr#Arena_script -> Game.Model.pas#Spawn
```

## spec-script-initialization

There are no script leaves today (decision 2).

```text
missing file Game.Bootstrap.pas -> Game.Util.pas
missing leaf Game.Bootstrap.pas#Bootstrap_script -> Game.Util.pas#Register
missing leaf Game.Bootstrap.pas#Bootstrap_script -> Game.Util.pas#Unregister
```

## spec-unused-uses

There are no script leaves today (decision 2).

```text
missing leaf Game.Model.pas#Model_script -> Game.Model.pas#Count
```

## spec-uses-in

There are no script leaves today (decision 2).

```text
missing file App.dpr -> src/Game.Model.pas
missing leaf App.dpr#App_script -> src/Game.Model.pas#TCreature
```
