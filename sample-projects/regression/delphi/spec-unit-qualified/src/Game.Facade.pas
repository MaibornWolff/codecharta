unit Game.Facade;

interface

uses Game.Domain.Creature, Game.Dto.Creature;

type
  TFacade = class
    Domain: Game.Domain.Creature.TCreature;
    Dto: TCreature;
  end;

implementation

end.
