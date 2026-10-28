unit Game.Helper;

interface

uses Game.Model, Game.Util;

type
  TCreatureHelper = class helper for TCreature
    function Title: string;
  end;

implementation

function TCreatureHelper.Title: string;
begin
  Result := Upper(Name);
end;

end.
