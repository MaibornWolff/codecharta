unit de.sots.cellarsandcentaurs.domain.model.Creature;

interface

uses
  System.Generics.Collections,
  de.sots.cellarsandcentaurs.domain.model.CreatureId,
  de.sots.cellarsandcentaurs.domain.model.CreatureType,
  de.sots.cellarsandcentaurs.domain.model.ArmorClass,
  de.sots.cellarsandcentaurs.domain.model.SpeedType,
  de.sots.cellarsandcentaurs.domain.model.Speed,
  de.sots.cellarsandcentaurs.domain.model.HitPoints,
  de.sots.cellarsandcentaurs.domain.model.Fightable;

type
  /// A creature that roams the cellar. Centaurs, beasts and dragons all share hit points, armor class and speeds.
  TCreature = class(TInterfacedObject, IFightable)
  private
    FId: TCreatureId;
    FCreatureType: TCreatureType;
    FArmorClass: TArmorClass;
    FSpeeds: TDictionary<TSpeedType, TSpeed>;
    FHitPoints: THitPoints;
    FXPValue: Integer;
  public
    constructor Create(const AId: TCreatureId); overload;
    constructor Create(const AId: TCreatureId; ACreatureType: TCreatureType); overload;
    destructor Destroy; override;
    function Attack(const ATarget: IFightable): Integer; virtual;
    function IsAlive: Boolean;
    property Id: TCreatureId read FId write FId;
    property CreatureType: TCreatureType read FCreatureType write FCreatureType;
    property ArmorClass: TArmorClass read FArmorClass write FArmorClass;
    property Speeds: TDictionary<TSpeedType, TSpeed> read FSpeeds;
    property HitPoints: THitPoints read FHitPoints write FHitPoints;
    property XPValue: Integer read FXPValue write FXPValue;
  end;

implementation

uses
  de.sots.cellarsandcentaurs.application.Api;

constructor TCreature.Create(const AId: TCreatureId);
begin
  Create(AId, TCreatureFacade.STANDARD_CREATURE_TYPE);
end;

constructor TCreature.Create(const AId: TCreatureId; ACreatureType: TCreatureType);
begin
  inherited Create;
  FId := AId;
  FCreatureType := ACreatureType;
  FSpeeds := TDictionary<TSpeedType, TSpeed>.Create;
end;

destructor TCreature.Destroy;
begin
  FSpeeds.Free;
  FArmorClass.Free;
  inherited;
end;

function TCreature.Attack(const ATarget: IFightable): Integer;
begin
  Result := FArmorClass.Total;
end;

function TCreature.IsAlive: Boolean;
begin
  Result := FHitPoints.Current > 0;
end;

end.
