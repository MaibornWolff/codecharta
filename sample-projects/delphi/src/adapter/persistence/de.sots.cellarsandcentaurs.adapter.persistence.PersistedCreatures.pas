unit de.sots.cellarsandcentaurs.adapter.persistence.PersistedCreatures;

interface

uses
  de.sots.cellarsandcentaurs.adapter.persistence.CreatureRepository,
  de.sots.cellarsandcentaurs.domain.service.Creatures,
  de.sots.cellarsandcentaurs.domain.model.Creature,
  de.sots.cellarsandcentaurs.domain.model.CreatureId;

type
  TPersistedCreatures = class(TInterfacedObject, ICreatures)
  private
    FRepository: TCreatureRepository;
  public
    constructor Create(ARepository: TCreatureRepository);
    procedure Save(ACreature: TCreature);
    function Find(const AId: TCreatureId): TCreature;
  end;

implementation

uses
  de.sots.cellarsandcentaurs.adapter.persistence.CreatureEntity,
  de.sots.cellarsandcentaurs.domain.model.NoSuchCreatureException,
  de.sots.cellarsandcentaurs.application.Api;

constructor TPersistedCreatures.Create(ARepository: TCreatureRepository);
begin
  inherited Create;
  FRepository := ARepository;
end;

procedure TPersistedCreatures.Save(ACreature: TCreature);
begin
  FRepository.Save(ACreature.Id.Value, TCreatureEntity.Create(ACreature.Id.Value));
end;

function TPersistedCreatures.Find(const AId: TCreatureId): TCreature;
var
  Entity: TCreatureEntity;
begin
  Entity := FRepository.FindOne(AId.Value);
  if Entity = nil then
    raise ENoSuchCreatureException.Create(AId);
  Result := TCreature.Create(TCreatureId.Create(Entity.Id), TCreatureFacade.STANDARD_CREATURE_TYPE);
end;

end.
