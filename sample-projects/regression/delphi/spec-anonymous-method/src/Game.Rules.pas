unit Game.Rules;

interface

type
  TIdFactory = reference to function: Integer;
  TRules = class
    function Factory: TIdFactory;
  end;

implementation

uses Game.Model;

function TRules.Factory: TIdFactory;
begin
  Result := function: Integer
    begin
      Result := TCreatureId.NewId;
    end;
end;

end.
