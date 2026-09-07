unit de.sots.cellarsandcentaurs.adapter.persistence.CreatureGateway;

interface

uses
  de.sots.cellarsandcentaurs.domain.service.Creatures;

type
  TCreatureGateway = class(TInterfacedObject, ICreatures)
  private
    FCreatures: ICreatures;
  public
    constructor Create(const ACreatures: ICreatures);
    property Creatures: ICreatures read FCreatures implements ICreatures;
  end;

implementation

constructor TCreatureGateway.Create(const ACreatures: ICreatures);
begin
  inherited Create;
  FCreatures := ACreatures;
end;

end.
