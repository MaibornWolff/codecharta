unit de.sots.cellarsandcentaurs.domain.service.CreatureService;

interface

uses
  Spring.Logging,
  de.sots.cellarsandcentaurs.domain.service.Creatures,
  de.sots.cellarsandcentaurs.domain.model.Creature;

type
  TCreatureService = class
  private
    FCreatures: ICreatures;
    FLogger: ILogger;
  public
    constructor Create(const ACreatures: ICreatures; const ALogger: ILogger);
    procedure Save(ACreature: TCreature);
  end;

implementation

constructor TCreatureService.Create(const ACreatures: ICreatures; const ALogger: ILogger);
begin
  inherited Create;
  FCreatures := ACreatures;
  FLogger := ALogger;
end;

procedure TCreatureService.Save(ACreature: TCreature);
begin
  FLogger.Info('Saving creature ' + ACreature.Id.Value);
  FCreatures.Save(ACreature);
end;

end.
