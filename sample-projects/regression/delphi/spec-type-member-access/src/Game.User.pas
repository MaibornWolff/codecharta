unit Game.User;

interface

uses Game.Model, Game.Kinds;

type
  TUser = class
    procedure Run;
  end;

implementation

procedure TUser.Run;
var
  Number: Integer;
  Kind: TKind;
begin
  TCreature.Spawn.Free;
  Number := TCreature.Count;
  Kind := TKind.Beast;
  Boss.Free;
end;

end.
