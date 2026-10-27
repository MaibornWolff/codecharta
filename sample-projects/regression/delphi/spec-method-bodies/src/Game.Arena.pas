unit Game.Arena;

interface

type
  TArena = class
    procedure Spawn;
  end;

implementation

uses Game.Model;

procedure TArena.Spawn;
var
  Boss: TCreature;
begin
  Boss := TCreature.Create;
  Boss.Free;
end;

end.
