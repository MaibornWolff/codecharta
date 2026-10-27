unit Game.Dice;

interface

function RollD20: Integer;

implementation

uses Game.Model;

function RollD20: Integer;
var
  Roller: TCreature;
begin
  Roller := nil;
  Result := 20;
end;

end.
