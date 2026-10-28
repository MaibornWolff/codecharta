unit Game.Rules;

interface

type
  TRules = class
    procedure Check(Thing: TObject);
  end;

implementation

uses Game.Model;

procedure TRules.Check(Thing: TObject);
var
  Gold: ^TTreasure;
begin
  Gold := nil;
  if Thing is TCentaur then
    (Thing as THerd).Free;
  if TLair(Thing) = nil then
    Exit;
  try
    Thing.Free;
  except
    on E: EFail do
      Exit;
  end;
end;

end.
