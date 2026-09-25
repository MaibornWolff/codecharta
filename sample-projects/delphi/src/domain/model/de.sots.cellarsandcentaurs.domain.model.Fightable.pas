unit de.sots.cellarsandcentaurs.domain.model.Fightable;

interface

type
  IFightable = interface
    ['{7B3C0F7E-2C6A-4F0B-9E1D-5A2B8C4D6E7F}']
    function Attack(const ATarget: IFightable): Integer;
    function IsAlive: Boolean;
  end;

implementation

end.
