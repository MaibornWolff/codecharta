unit Game.Arena;

interface

type
  TArena = class
    procedure Fight;
  end;

implementation

uses Game.Model;

procedure TArena.Fight;
begin
  var Stat: TStat := nil;
  var Boss := TCreature.Create;
  Boss.Free;
end;

end.
