unit encounterlog;

{$mode objfpc}{$H+}

interface

uses
  de.sots.cellarsandcentaurs.domain.model.Creature;

type
  TEncounterLog = class
  public
    function Describe(ACreature: TCreature): string;
  end;

implementation

function TEncounterLog.Describe(ACreature: TCreature): string;
begin
  if ACreature = nil then
    Exit('empty lair');
  Result := ACreature.ClassName;
end;

end.
