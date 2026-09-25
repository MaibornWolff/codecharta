unit de.sots.cellarsandcentaurs.application.dto.Creature;

interface

type
  TCreature = class
  private
    FId: string;
    FCreatureType: string;
    FHitPoints: Integer;
  public
    property Id: string read FId write FId;
    property CreatureType: string read FCreatureType write FCreatureType;
    property HitPoints: Integer read FHitPoints write FHitPoints;
  end;

implementation

end.
