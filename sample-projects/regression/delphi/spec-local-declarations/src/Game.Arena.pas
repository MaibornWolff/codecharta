unit Game.Arena;

interface

type
  TArena = class
    procedure Fight;
  end;

implementation

uses Game.Other, Game.Model;

procedure TArena.Fight;
type
  TLocal = record
    Boss: TCreature;
  end;
var
  Local: TLocal;

  procedure Nested;
  var
    Other: TCreature;
  begin
    Other := nil;
  end;

begin
  Local.Boss := nil;
  Nested;
end;

end.
