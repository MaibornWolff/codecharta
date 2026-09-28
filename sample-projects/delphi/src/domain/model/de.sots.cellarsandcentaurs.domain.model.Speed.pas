unit de.sots.cellarsandcentaurs.domain.model.Speed;

interface

type
  TSpeed = record
  private
    FFeetPerRound: Integer;
  public
    constructor Create(AFeetPerRound: Integer);
    function IsMoving: Boolean;
    property FeetPerRound: Integer read FFeetPerRound write FFeetPerRound;
  end;

implementation

constructor TSpeed.Create(AFeetPerRound: Integer);
begin
  FFeetPerRound := AFeetPerRound;
end;

function TSpeed.IsMoving: Boolean;
begin
  Result := FFeetPerRound > 0;
end;

end.
