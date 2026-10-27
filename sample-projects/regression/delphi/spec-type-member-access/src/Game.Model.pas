unit Game.Model;

interface

type
  TCreature = class
    class function Spawn: TCreature;
    class var Count: Integer;
  end;

var
  Boss: TCreature;

implementation

class function TCreature.Spawn: TCreature;
begin
  Result := TCreature.Create;
end;

end.
