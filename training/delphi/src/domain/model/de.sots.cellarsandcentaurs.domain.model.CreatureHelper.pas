unit de.sots.cellarsandcentaurs.domain.model.CreatureHelper;

interface

uses
  de.sots.cellarsandcentaurs.domain.model.Creature;

type
  TCreatureHelper = class helper for TCreature
  public
    function IsWounded: Boolean;
  end;

implementation

function TCreatureHelper.IsWounded: Boolean;
begin
  Result := HitPoints.Current < HitPoints.Max;
end;

end.
