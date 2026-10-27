unit Game.User;

interface

uses Game.Kinds;

type
  TUser = class
    function IsMonster(Value: Integer): Boolean;
    function IsBeast(Value: Integer): Boolean;
  end;

implementation

function TUser.IsMonster(Value: Integer): Boolean;
begin
  Result := Value = Ord(kMonster);
end;

function TUser.IsBeast(Value: Integer): Boolean;
begin
  Result := Value = Ord(TKind.kBeast);
end;

end.
