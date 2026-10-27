unit Game.Model;

interface

type
  TCreature = class
    function Name: string;
  end;

implementation

function TCreature.Name: string;
begin
  Result := 'centaur';
end;

end.
