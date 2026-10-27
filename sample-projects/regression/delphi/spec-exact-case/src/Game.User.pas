unit Game.User;

interface

uses Game.Model;

type
  TUser = class
    Boss: tcreature;
    function Calc(hp: Integer): Integer;
  end;

implementation

function TUser.Calc(hp: Integer): Integer;
begin
  Result := HP + Spawn + spawn;
end;

end.
