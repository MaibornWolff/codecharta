unit Game.Centaur;

interface

uses Game.Dice;

type
  TCentaur = class
    function Attack: Integer;
  end;

implementation

function TCentaur.Attack: Integer;
begin
  Result := RollD20;
end;

end.
