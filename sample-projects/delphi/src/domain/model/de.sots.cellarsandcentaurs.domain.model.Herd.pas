unit de.sots.cellarsandcentaurs.domain.model.Herd;

interface

uses
  System.Generics.Collections,
  de.sots.cellarsandcentaurs.domain.model.Centaur;

type
  THerd = class
  private
    FCentaurs: TList<TCentaur>;
  public
    constructor Create;
    destructor Destroy; override;
    function Count: Integer;
  end;

implementation

constructor THerd.Create;
begin
  inherited Create;
  FCentaurs := TList<TCentaur>.Create;
end;

destructor THerd.Destroy;
begin
  FCentaurs.Free;
  inherited;
end;

function THerd.Count: Integer;
begin
  Result := FCentaurs.Count;
end;

end.
