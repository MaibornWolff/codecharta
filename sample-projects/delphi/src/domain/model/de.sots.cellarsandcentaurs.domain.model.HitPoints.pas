unit de.sots.cellarsandcentaurs.domain.model.HitPoints;

interface

const
  MAX_HIT_POINTS = 999;

type
  /// Hit points drop when the creature takes damage and recover when it rests in its lair.
  THitPoints = record
  private
    FCurrent: Integer;
    FMax: Integer;
    FTemporary: Integer;
  public
    constructor Create(ACurrent, AMax: Integer; ATemporary: Integer = 0);
    class function Init(AMax: Integer): THitPoints; static;
    function TakeDamage(AAmount: Integer): THitPoints;
    property Current: Integer read FCurrent;
    property Max: Integer read FMax;
    property Temporary: Integer read FTemporary;
  end;

implementation

uses
  System.Math;

constructor THitPoints.Create(ACurrent, AMax: Integer; ATemporary: Integer);
begin
  FCurrent := ACurrent;
  FMax := Min(AMax, MAX_HIT_POINTS);
  FTemporary := ATemporary;
end;

class function THitPoints.Init(AMax: Integer): THitPoints;
begin
  Result := THitPoints.Create(AMax, AMax, 0);
end;

function THitPoints.TakeDamage(AAmount: Integer): THitPoints;
begin
  Result := THitPoints.Create(Max(FCurrent - AAmount, 0), FMax, FTemporary);
end;

end.
