# Known gaps: Delphi

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/delphi.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once a
gap closes, and the closed lines are deleted here.


## spec-conditional-routine-body

Both branches of an `{$IFDEF}` count, so a routine whose `begin` block stands in one branch and its `asm` block in the
other, closed by one `end;` after `{$ENDIF}` (HeidiSQL's `StrSwapByteOrder`), reads as a `begin` block without its
end: the routines after it are lost or taken into it. Kept as a gap (Christian, 2026-10-28).

```text
missing file Game.Swap.pas -> Game.Helper.pas
missing leaf Game.Swap.pas#Report -> Game.Helper.pas#THelper
```
