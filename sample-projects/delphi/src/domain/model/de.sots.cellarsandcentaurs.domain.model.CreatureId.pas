unit de.sots.cellarsandcentaurs.domain.model.CreatureId;

interface

uses
  System.SysUtils;

type
  TCreatureId = record
  private
    FValue: string;
  public
    constructor Create(const AValue: string);
    class function NewId: TCreatureId; static;
    property Value: string read FValue;
  end;

implementation

constructor TCreatureId.Create(const AValue: string);
begin
  FValue := AValue;
end;

class function TCreatureId.NewId: TCreatureId;
begin
  Result := TCreatureId.Create(TGUID.NewGuid.ToString);
end;

end.
