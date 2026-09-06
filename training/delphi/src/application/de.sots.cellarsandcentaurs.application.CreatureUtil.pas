unit de.sots.cellarsandcentaurs.application.CreatureUtil;

interface

uses
  de.sots.cellarsandcentaurs.domain.model.Fightable,
  de.sots.cellarsandcentaurs.domain.model.Creature,
  de.sots.cellarsandcentaurs.domain.model.Speed,
  SpeedType;

type
  TCreatureUtil = class
  public const
    STANDARD_ARMOR_CLASS_DESCRIPTION = 'Natural Armor';
  public
    { Counts the treasure hoard a creature guards. }
    class function TreasureHoard(ACreature: TCreature): Integer; static;
    class function SpeedOf(ACreature: TCreature; AType: TSpeedType): de.sots.cellarsandcentaurs.domain.model.Speed.TSpeed; static;
  end;

implementation

class function TCreatureUtil.TreasureHoard(ACreature: TCreature): Integer;
begin
  Result := ACreature.XPValue * ACreature.ArmorClass.Total;
end;

class function TCreatureUtil.SpeedOf(ACreature: TCreature; AType: TSpeedType): de.sots.cellarsandcentaurs.domain.model.Speed.TSpeed;
begin
  if not ACreature.Speeds.TryGetValue(AType, Result) then
    Result := TSpeed.Create(0);
end;

end.
