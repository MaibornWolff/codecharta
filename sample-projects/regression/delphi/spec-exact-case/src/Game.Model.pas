unit Game.Model;

interface

type
  TCreature = class
  end;

const
  HP = 10;

function Spawn: Integer;

implementation

function Spawn: Integer;
begin
  Result := 1;
end;

end.
