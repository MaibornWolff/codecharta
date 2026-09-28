unit de.sots.cellarsandcentaurs.domain.service.CreatureServiceTest;

interface

uses
  DUnitX.TestFramework,
  Spring.Logging,
  de.sots.cellarsandcentaurs.domain.service.CreatureService,
  de.sots.cellarsandcentaurs.domain.service.Creatures,
  de.sots.cellarsandcentaurs.domain.model.Creature,
  de.sots.cellarsandcentaurs.domain.model.CreatureId;

type
  TStableCreatures = class(TInterfacedObject, ICreatures)
  private
    FSaved: TCreature;
  public
    procedure Save(ACreature: TCreature);
    function Find(const AId: TCreatureId): TCreature;
    property Saved: TCreature read FSaved;
  end;

  [TestFixture]
  TCreatureServiceTest = class
  private
    FStable: TStableCreatures;
    FService: TCreatureService;
  public
    [Setup]
    procedure Setup;
    [TearDown]
    procedure TearDown;
    [Test]
    procedure should_save_creature_to_the_stable;
  end;

implementation

uses
  de.sots.cellarsandcentaurs.domain.model.Speed,
  de.sots.cellarsandcentaurs.domain.model.SpeedType;

procedure TStableCreatures.Save(ACreature: TCreature);
begin
  FSaved := ACreature;
end;

function TStableCreatures.Find(const AId: TCreatureId): TCreature;
begin
  Result := FSaved;
end;

procedure TCreatureServiceTest.Setup;
begin
  FStable := TStableCreatures.Create;
  FService := TCreatureService.Create(FStable, nil);
end;

procedure TCreatureServiceTest.TearDown;
begin
  FService.Free;
end;

procedure TCreatureServiceTest.should_save_creature_to_the_stable;
var
  Creature: TCreature;
  walking_speed: TSpeed;
begin
  Creature := TCreature.Create(TCreatureId.Create('centaur-1'));
  walking_speed := TSpeed.Create(40);
  Creature.Speeds.Add(stWalking, walking_speed);

  FService.Save(Creature);

  Assert.AreSame(Creature, FStable.Saved);
end;

initialization
  TDUnitX.RegisterTestFixture(TCreatureServiceTest);

end.
