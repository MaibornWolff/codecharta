unit de.sots.cellarsandcentaurs.domain.model.ArmorClass;

interface

type
  TArmorClass = class
  private
    FDescription: string;
    FBase: Integer;
    FBonus: Integer;
    FTotal: Integer;
  public
    constructor Create(ABase, ABonus: Integer); overload;
    constructor Create(ABase, ABonus: Integer; const ADescription: string); overload;
    property Description: string read FDescription;
    property Base: Integer read FBase write FBase;
    property Bonus: Integer read FBonus write FBonus;
    property Total: Integer read FTotal write FTotal;
  end;

implementation

uses
  de.sots.cellarsandcentaurs.application.Api;

constructor TArmorClass.Create(ABase, ABonus: Integer);
begin
  Create(ABase, ABonus, TCreatureUtil.STANDARD_ARMOR_CLASS_DESCRIPTION);
end;

constructor TArmorClass.Create(ABase, ABonus: Integer; const ADescription: string);
begin
  inherited Create;
  FDescription := ADescription;
  FBase := ABase;
  FBonus := ABonus;
  FTotal := ABase + ABonus;
end;

end.
