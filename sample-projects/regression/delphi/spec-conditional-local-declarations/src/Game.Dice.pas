unit Game.Dice;

interface

function Normalize(Value: Integer): Integer;
function Lookup: TObject;

implementation

uses Game.Model;

function Normalize(Value: Integer): Integer;
{$IFDEF MSWINDOWS}
var
  Index: Integer;
{$ENDIF}
begin
  Result := Value;
end;

function Lookup: TObject;
begin
  Result := DefaultCreature;
end;

end.
