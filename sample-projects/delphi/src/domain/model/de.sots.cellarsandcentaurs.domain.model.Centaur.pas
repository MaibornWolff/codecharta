unit de.sots.cellarsandcentaurs.domain.model.Centaur;

interface

uses
  de.sots.cellarsandcentaurs.domain.model.Creature,
  de.sots.cellarsandcentaurs.domain.model.CreatureId,
  de.sots.cellarsandcentaurs.domain.model.Speed,
  de.sots.cellarsandcentaurs.domain.model.Fightable;

type
  TCentaur = class(TCreature)
  public
    constructor Create(const AId: TCreatureId);
    function Attack(const ATarget: IFightable): Integer; override;
    function Gallop: TSpeed;
  end;

implementation

uses
  de.sots.cellarsandcentaurs.domain.model.CreatureType,
  de.sots.cellarsandcentaurs.domain.model.Dice;

constructor TCentaur.Create(const AId: TCreatureId);
begin
  inherited Create(AId, ctMonstrosity);
end;

function TCentaur.Attack(const ATarget: IFightable): Integer;
begin
  Result := inherited Attack(ATarget) + RollD20.Value;
end;

function TCentaur.Gallop: TSpeed;
begin
  Result := TSpeed.Create(50);
end;

end.
