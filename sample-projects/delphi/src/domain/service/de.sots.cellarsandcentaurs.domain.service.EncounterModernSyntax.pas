unit de.sots.cellarsandcentaurs.domain.service.EncounterModernSyntax;

interface

uses
  de.sots.cellarsandcentaurs.domain.model.Creature;

type
  TEncounterModernSyntax = class
  public
    function InlineVariables(ACount: Integer): Integer;
    function MultiLineString: string;
    function ConditionalExpression(ARoll: Integer): Integer;
    function NegatedOperators(ACreature: TObject; ARoll: Integer): Boolean;
  end;

implementation

function TEncounterModernSyntax.InlineVariables(ACount: Integer): Integer;
begin
  var Total := 0;
  for var Index := 1 to ACount do
    Inc(Total, Index);
  Result := Total;
end;

function TEncounterModernSyntax.MultiLineString: string;
begin
  Result := '''
    if the centaur charges // roll for initiative
    { then } the dragon answers (* with fire *)
    ''';
end;

function TEncounterModernSyntax.ConditionalExpression(ARoll: Integer): Integer;
begin
  Result := if ARoll > 15 then 2 else 1;
end;

function TEncounterModernSyntax.NegatedOperators(ACreature: TObject; ARoll: Integer): Boolean;
begin
  Result := (ACreature is not TCreature) or (ARoll not in [1, 20]);
end;

end.
