unit de.sots.cellarsandcentaurs.domain.model.NoSuchCreatureException;

interface

uses
  System.SysUtils,
  de.sots.cellarsandcentaurs.domain.model.CreatureId;

type
  ENoSuchCreatureException = class(Exception)
  private
    FId: TCreatureId;
  public
    constructor Create(const AId: TCreatureId);
    property Id: TCreatureId read FId;
  end;

implementation

constructor ENoSuchCreatureException.Create(const AId: TCreatureId);
begin
  inherited Create('No such creature in the dungeon: ' + AId.Value);
  FId := AId;
end;

end.
