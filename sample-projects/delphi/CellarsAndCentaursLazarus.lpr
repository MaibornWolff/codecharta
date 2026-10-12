program CellarsAndCentaursLazarus;

{$mode delphi}

uses
  SysUtils,
  de.sots.cellarsandcentaurs.domain.model.Dice;

function RollUntilCritical: Integer;
begin
  Result := 0;
  while RollD20.Value < 20 do
    Inc(Result);
end;

begin
  Writeln(RollUntilCritical);
end.
