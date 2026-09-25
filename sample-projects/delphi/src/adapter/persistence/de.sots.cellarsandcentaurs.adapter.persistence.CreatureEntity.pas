unit de.sots.cellarsandcentaurs.adapter.persistence.CreatureEntity;

interface

uses
  de.sots.cellarsandcentaurs.adapter.persistence.Mapping;

type
  [Table('creatures')]
  TCreatureEntity = class
  private
    [Column('id')]
    FId: string;
  public
    constructor Create(const AId: string = '');
    property Id: string read FId write FId;
  end;

implementation

constructor TCreatureEntity.Create(const AId: string);
begin
  inherited Create;
  if AId <> '' then
    FId := AId
  else
    FId := 'ididid';
end;

end.
