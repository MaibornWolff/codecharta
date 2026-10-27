unit Game.User;

interface

uses Game.Limits;

type
  TUser = class
    function Hp: Integer;
  end;

implementation

function TUser.Hp: Integer;
begin
  if Current = NoBoss then
    Result := MaxHp + PerThread + Length(SName)
  else
    Result := 0;
end;

end.
