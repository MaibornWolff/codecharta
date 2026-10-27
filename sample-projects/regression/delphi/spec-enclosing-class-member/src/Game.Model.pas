unit Game.Model;

interface

uses Game.Util;

type
  TOuter = class
  public const
    Limit = 5;
  public type
    TInner = class
      function Get: Integer;
    end;
  end;

implementation

function TOuter.TInner.Get: Integer;
begin
  Result := Limit + Other;
end;

end.
