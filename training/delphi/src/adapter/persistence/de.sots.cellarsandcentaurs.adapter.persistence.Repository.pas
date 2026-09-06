unit de.sots.cellarsandcentaurs.adapter.persistence.Repository;

interface

uses
  System.Generics.Collections;

type
  TRepository<T: class> = class
  private
    FItems: TObjectDictionary<string, T>;
  public
    constructor Create;
    destructor Destroy; override;
    procedure Save(const AKey: string; AItem: T);
    function FindOne(const AKey: string): T;
    function FindAll: TArray<T>;
  end;

implementation

constructor TRepository<T>.Create;
begin
  inherited Create;
  FItems := TObjectDictionary<string, T>.Create([doOwnsValues]);
end;

destructor TRepository<T>.Destroy;
begin
  FItems.Free;
  inherited;
end;

procedure TRepository<T>.Save(const AKey: string; AItem: T);
begin
  FItems.AddOrSetValue(AKey, AItem);
end;

function TRepository<T>.FindOne(const AKey: string): T;
begin
  if not FItems.TryGetValue(AKey, Result) then
    Result := nil;
end;

function TRepository<T>.FindAll: TArray<T>;
begin
  Result := FItems.Values.ToArray;
end;

end.
