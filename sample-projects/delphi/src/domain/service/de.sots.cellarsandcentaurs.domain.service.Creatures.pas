unit de.sots.cellarsandcentaurs.domain.service.Creatures;

interface

uses
  de.sots.cellarsandcentaurs.domain.model.Creature,
  de.sots.cellarsandcentaurs.domain.model.CreatureId;

type
  ICreatures = interface
    ['{A1D2E3F4-5B6C-4D7E-8F90-1A2B3C4D5E6F}']
    procedure Save(ACreature: TCreature);
    function Find(const AId: TCreatureId): TCreature;
  end;

implementation

end.
