unit de.sots.cellarsandcentaurs.application.CreatureFacade;

interface

uses
  System.SysUtils,
  de.sots.cellarsandcentaurs.application.dto.Creature,
  de.sots.cellarsandcentaurs.domain.service.CreatureService,
  de.sots.cellarsandcentaurs.domain.model.CreatureType,
  de.sots.cellarsandcentaurs.domain.model.Speed,
  de.sots.cellarsandcentaurs.domain.model.ArmorClass,
  de.sots.cellarsandcentaurs.domain.model.Creature;

type
  TCreatureFacade = class
  public const
    STANDARD_CREATURE_TYPE: TCreatureType = ctMonstrosity;
    STABLE_NAME = 'centaur-stable';
  private
    FCreatureService: TCreatureService;
    function GenerateId: string;
  public
    constructor Create(ACreatureService: TCreatureService);
    function CreateCreature(AType: TCreatureType; const AWalkSpeed, AFlySpeed, ASwimSpeed, ABurrowSpeed,
      AClimbSpeed: TSpeed; AArmorClass: TArmorClass; AHitPointsValue: Integer): TCreature;
    function ToDto(ACreature: TCreature): de.sots.cellarsandcentaurs.application.dto.Creature.TCreature;
  end;

implementation

uses
  de.sots.cellarsandcentaurs.domain.model.CreatureId,
  de.sots.cellarsandcentaurs.domain.model.HitPoints,
  de.sots.cellarsandcentaurs.domain.model.SpeedType;

constructor TCreatureFacade.Create(ACreatureService: TCreatureService);
begin
  inherited Create;
  FCreatureService := ACreatureService;
end;

function TCreatureFacade.CreateCreature(AType: TCreatureType; const AWalkSpeed, AFlySpeed, ASwimSpeed, ABurrowSpeed,
  AClimbSpeed: TSpeed; AArmorClass: TArmorClass; AHitPointsValue: Integer): TCreature;
var
  Creature: TCreature;
  walkingSpeed: TSpeed;
begin
  // Rolls initiative for every creature in the dungeon before the encounter starts.
  walkingSpeed := AWalkSpeed;
  Creature := TCreature.Create(TCreatureId.Create(GenerateId));
  Creature.ArmorClass := AArmorClass;
  Creature.HitPoints := THitPoints.Init(AHitPointsValue);
  Creature.CreatureType := AType;
  Creature.Speeds.Add(stWalking, walkingSpeed);
  Creature.Speeds.Add(stFlying, AFlySpeed);
  Creature.Speeds.Add(stSwimming, ASwimSpeed);
  Creature.Speeds.Add(stBurrowing, ABurrowSpeed);
  Creature.Speeds.Add(stClimbing, AClimbSpeed);
  FCreatureService.Save(Creature);
  Result := Creature;
end;

function TCreatureFacade.ToDto(ACreature: TCreature): de.sots.cellarsandcentaurs.application.dto.Creature.TCreature;
begin
  Result := de.sots.cellarsandcentaurs.application.dto.Creature.TCreature.Create;
  Result.Id := ACreature.Id.Value;
  Result.HitPoints := ACreature.HitPoints.Current;
  Result.CreatureType := STABLE_NAME;
end;

function TCreatureFacade.GenerateId: string;
begin
  Result := TGUID.NewGuid.ToString;
end;

end.
