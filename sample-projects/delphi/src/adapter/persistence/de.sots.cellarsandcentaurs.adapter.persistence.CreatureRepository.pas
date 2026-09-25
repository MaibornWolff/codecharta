unit de.sots.cellarsandcentaurs.adapter.persistence.CreatureRepository;

interface

uses
  de.sots.cellarsandcentaurs.adapter.persistence.Repository,
  de.sots.cellarsandcentaurs.adapter.persistence.CreatureEntity;

type
  TEntity = TCreatureEntity;

  TCreatureRepository = class(TRepository<TEntity>)
  public
    function FindByName(const AName: string): TEntity;
  end;

implementation

function TCreatureRepository.FindByName(const AName: string): TEntity;
var
  Entity: TEntity;
begin
  Result := nil;
  for Entity in FindAll do
    if Entity.Id = AName then
      Exit(Entity);
end;

end.
