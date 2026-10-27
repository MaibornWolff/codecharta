unit Game.Model;

interface

type
  TCreature = class
  end;

function Spawn: TCreature;

implementation

function Spawn: TCreature;
begin
  Result := TCreature.Create;
end;

end.
