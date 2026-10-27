unit Game.Child;

interface

uses Game.Base, Game.Util;

type
  TChild = class(TBase)
    function Call: Integer;
  end;

implementation

function TChild.Call: Integer;
begin
  Result := Fn + Other;
end;

end.
