unit de.sots.cellarsandcentaurs.adapter.persistence.Mapping;

interface

type
  TableAttribute = class(TCustomAttribute)
  private
    FName: string;
  public
    constructor Create(const AName: string);
    property Name: string read FName;
  end;

  ColumnAttribute = class(TCustomAttribute)
  private
    FName: string;
  public
    constructor Create(const AName: string);
    property Name: string read FName;
  end;

implementation

constructor TableAttribute.Create(const AName: string);
begin
  inherited Create;
  FName := AName;
end;

constructor ColumnAttribute.Create(const AName: string);
begin
  inherited Create;
  FName := AName;
end;

end.
