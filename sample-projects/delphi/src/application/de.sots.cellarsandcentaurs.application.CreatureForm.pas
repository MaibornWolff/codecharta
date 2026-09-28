unit de.sots.cellarsandcentaurs.application.CreatureForm;

interface

uses
  Vcl.Forms,
  de.sots.cellarsandcentaurs.domain.model.Creature;

type
  TCreatureForm = class(TForm)
  private
    FGold: Integer;
  public
    procedure ShowCreatureKind;
    procedure CountGold(AGold: Integer);
  end;

implementation

uses
  de.sots.cellarsandcentaurs.domain.model.Treasure;

procedure TCreatureForm.ShowCreatureKind;
begin
  Caption := TCreature.ClassName;
end;

procedure TCreatureForm.CountGold(AGold: Integer);
begin
  FGold := TTreasure.Create(AGold).Gold;
end;

end.
