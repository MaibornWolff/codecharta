unit Game.User;

interface

uses Game.Limits;

function Calc(Hp: Integer): Integer;

implementation

function Calc(Hp: Integer): Integer;
var
  Count, Index: Integer;
begin
  Count := Hp;
  for Index := 0 to 1 do
    Count := Count + Index;
  Result := Count + MaxHp;
end;

end.
