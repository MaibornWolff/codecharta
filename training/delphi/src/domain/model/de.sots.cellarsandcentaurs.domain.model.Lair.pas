unit de.sots.cellarsandcentaurs.domain.model.Lair;

interface

uses
  de.sots.cellarsandcentaurs.domain.model.Treasure;

{$I Constants.inc}

type
  TLair = class
  private
    FTreasure: TTreasure;
  public
    constructor Create(AGold: Integer);
    function IsFull: Boolean;
    property Treasure: TTreasure read FTreasure;
  end;

implementation

constructor TLair.Create(AGold: Integer);
begin
  inherited Create;
  FTreasure := TTreasure.Create(AGold);
end;

function TLair.IsFull: Boolean;
begin
  Result := FTreasure.Gold >= MAX_LAIR_TREASURE;
end;

end.
