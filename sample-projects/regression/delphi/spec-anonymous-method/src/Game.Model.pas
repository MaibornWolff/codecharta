unit Game.Model;

interface

type
  TCreatureId = record
    class function NewId: Integer; static;
  end;

implementation

class function TCreatureId.NewId: Integer;
begin
  Result := 1;
end;

end.
