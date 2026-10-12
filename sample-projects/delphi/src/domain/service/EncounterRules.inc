// Shared rule, pulled into EncounterEdgeCases with the include directive.
function IsFlanked(AAttackers: Integer): Boolean;
begin
  if AAttackers > 1 then
    Exit(True);
  Result := False;
end;
