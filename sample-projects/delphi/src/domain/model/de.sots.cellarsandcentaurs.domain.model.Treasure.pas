unit de.sots.cellarsandcentaurs.domain.model.Treasure;

interface

type
  TTreasure = record
  private
    FGold: Integer;
  public
    constructor Create(AGold: Integer);
    property Gold: Integer read FGold;
  end;

implementation

constructor TTreasure.Create(AGold: Integer);
begin
  FGold := AGold;
end;

end.
