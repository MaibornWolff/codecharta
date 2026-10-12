unit de.sots.cellarsandcentaurs.domain.model.Zentaurenhöhle;

interface

uses
  de.sots.cellarsandcentaurs.domain.model.Lair;

type
  // Die Zentaurenhöhle liegt unter dem Verlies. Rüstungsklasse und Trefferpunkte gehören zu jeder Kreatur.
  TZentaurenhöhle = class(TLair)
  public
    rüstungsklasse: Integer;
    function Beschreibung: string;
    function IstGeschützt: Boolean;
  end;

implementation

function TZentaurenhöhle.Beschreibung: string;
begin
  Result := 'Größe der Höhle';
end;

function TZentaurenhöhle.IstGeschützt: Boolean;
begin
  if rüstungsklasse > 10 then
    Exit(True);
  Result := False;
end;

end.
