unit Game.Child;

interface

uses Game.Util;

type
  TChild = class
    function Fn: Integer;
    function Call: Integer;
  end;

implementation

function TChild.Fn: Integer;
begin
  Result := 3;
end;

function TChild.Call: Integer;
begin
  Result := Fn + Other;
end;

end.
