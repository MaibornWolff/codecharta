unit de.sots.cellarsandcentaurs.domain.service.EncounterResolver;

interface

uses
  System.SysUtils,
  System.Generics.Collections,
  de.sots.cellarsandcentaurs.domain.model.Creature,
  de.sots.cellarsandcentaurs.domain.model.SpeedType,
  de.sots.cellarsandcentaurs.domain.model.Dice;

type
  /// Resolves one encounter between two creatures.
  /// The attacker rolls the dice and adds its bonus.
  /// The defender answers with its armor class.
  /// Terrain changes the damage of the hit.
  /// Speeds decide who moves first in the dungeon.
  /// The result is the damage dealt to the defender.
  TEncounterResolver = class
  private
    FCreatures: TList<TCreature>;
    FLastHit: Boolean;
    FRollCount: Integer;
  public
    function Resolve(AAttacker, ADefender: TCreature; ARoll, ABonus: Integer; ATerrain: TSpeedType): Integer;
    function Describe(ACreature: TCreature): string;
    function SafeRoll(const ADice: TDice): Integer;
    function InitiativeOrder(ACreatures: TList<TCreature>): Integer;
    function IsEmpty: Boolean;
  end;

implementation

uses
  System.Math,
  de.sots.cellarsandcentaurs.domain.model.Speed,
  de.sots.cellarsandcentaurs.domain.model.NoSuchCreatureException;

const
  MAX_DAMAGE = 40;

function TEncounterResolver.Resolve(AAttacker, ADefender: TCreature; ARoll, ABonus: Integer;
  ATerrain: TSpeedType): Integer;
var
  Damage, Remaining: Integer;
  CurrentSpeed: TSpeed;
begin
  // A natural one always misses.
  if ARoll = 1 then
    Exit(0)
  else if ARoll = 20 then
    Damage := ABonus * 2
  else
    Damage := ABonus;
  // Fast creatures on their feet hit harder.
  for CurrentSpeed in AAttacker.Speeds.Values do
    if CurrentSpeed.IsMoving and (CurrentSpeed.FeetPerRound > 30) then
      Inc(Damage);
  Remaining := ARoll;
  while Remaining > 10 do
    Dec(Remaining, 10); // the roll wraps around every ten points
  case ATerrain of
    stFlying:
      Inc(Damage, 3);
    stSwimming:
      Dec(Damage);
    stBurrowing:
      Damage := 0;
  else
    Inc(Damage, Remaining);
  end;
  Damage := IfThen(Damage > MAX_DAMAGE, MAX_DAMAGE, Damage);
  FLastHit := (Damage > 0) or ADefender.IsAlive;
  // Damage := Damage + AAttacker.XPValue;
  Result := Damage;
end;

// Builds the short label shown in the encounter log.
function TEncounterResolver.Describe(ACreature: TCreature): string;
var
  Name, Summary: string;
begin
  Name := ACreature.ClassName().Trim().ToLower().Replace('t', '').PadLeft(12);
  Summary := Name.Trim().ToUpper().Substring(0, 8);
  Result := Summary;
end;

function TEncounterResolver.SafeRoll(const ADice: TDice): Integer;
var
  IsCritical: TFunc<Integer, Boolean>;
begin
  IsCritical := function(AValue: Integer): Boolean
    begin
      if AValue >= ADice.Sides then
        Exit(True);
      Result := False;
    end;
  Result := 0;
  try
    try
      Result := RollD20.Value;
      FLastHit := IsCritical(Result);
    except
      on E: ENoSuchCreatureException do
        Result := 1;
    end;
  finally
    Inc(FRollCount);
  end;
end;

function TEncounterResolver.InitiativeOrder(ACreatures: TList<TCreature>): Integer;

  function CountAlive(AIndex: Integer): Integer;
  begin
    if AIndex >= ACreatures.Count then
      Exit(0);
    Result := CountAlive(AIndex + 1) + Ord(ACreatures[AIndex].IsAlive);
  end;

begin
  FCreatures := ACreatures;
  Result := CountAlive(0);
end;

{ True when no creature has entered the encounter yet,
  which is the state right after construction. }
function TEncounterResolver.IsEmpty: Boolean;
begin
  Result := FCreatures.Count = 0;
end;

end.
