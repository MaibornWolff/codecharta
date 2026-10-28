unit Game.Base;

interface

type
  TBase = class
    function Fn: Integer;
  end;

implementation

function TBase.Fn: Integer;
begin
  Result := 3;
end;

end.
