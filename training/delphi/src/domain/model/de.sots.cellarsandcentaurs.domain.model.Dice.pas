unit de.sots.cellarsandcentaurs.domain.model.Dice;

interface

type
  TDice = record
  private
    FSides: Integer;
  public
    constructor Create(ASides: Integer);
    property Sides: Integer read FSides;
  end;

  TDiceRoll = record
    Dice: TDice;
    Value: Integer;
  end;

function RollD20: TDiceRoll;

implementation

constructor TDice.Create(ASides: Integer);
begin
  FSides := ASides;
end;

function RollD20: TDiceRoll;
var
  d20Roll: TDiceRoll;
begin
  d20Roll.Dice := TDice.Create(20);
  d20Roll.Value := Random(20) + 1;
  Result := d20Roll;
end;

end.
