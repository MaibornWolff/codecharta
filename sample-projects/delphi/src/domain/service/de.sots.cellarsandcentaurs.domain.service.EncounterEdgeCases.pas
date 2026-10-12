unit de.sots.cellarsandcentaurs.domain.service.EncounterEdgeCases;

{$IFDEF FPC}
  {$MODE DELPHI}
{$ENDIF}

interface

uses
  System.SysUtils,
  System.Classes,
  System.Generics.Collections,
  de.sots.cellarsandcentaurs.domain.model.Creature,
  de.sots.cellarsandcentaurs.domain.model.Fightable,
  de.sots.cellarsandcentaurs.domain.model.Treasure,
  de.sots.cellarsandcentaurs.domain.model.ArmorClass,
  de.sots.cellarsandcentaurs.domain.model.HitPoints,
  de.sots.cellarsandcentaurs.domain.service.EncounterResolver,
  de.sots.cellarsandcentaurs.application.CreatureForm;

type
  TRollCallback = function(ARoll: Integer): Boolean of object;
  TRollProc = reference to procedure(AValue: Integer);
  PTreasure = ^TTreasure;
  TCreatureFormClass = class of TCreatureForm;

  TRollRecord = record
    case Kind: Byte of
      0: (AsNumber: Integer);
      1: (AsText: string[10]);
  end;

  TModifier = record
    Value: Integer;
    class operator Add(const ALeft, ARight: TModifier): TModifier;
    class operator Implicit(AValue: Integer): TModifier;
  end;

  TRollHelper = record helper for Integer
    function IsCritical: Boolean;
  end;

  IEncounterLog = interface
    ['{6C3B1E0A-2F4D-4B7E-9A51-0D8E5C7F1A22}']
    procedure Log(const AFighter: IFightable);
    function Count: Integer;
  end;

  TEncounterQueue<T: TCreature> = class
  public
    function Pick(const AItems: TArray<T>; AIndex: Integer): T;
  end;

  TEncounterEdgeCases = class
  private
    FDifficulty: Integer;
    FResolver: TEncounterResolver;
    class var FInstances: Integer;
    function GetDifficulty: Integer;
    procedure SetDifficulty(const AValue: Integer);
  public
    class constructor Create;
    constructor Create(ADifficulty: Integer);
    destructor Destroy; override;
    class function Instances: Integer; static;
    class procedure Reset;
    function RepeatUntil(ACount: Integer): Integer;
    function ForIn(ACreatures: TList<TCreature>): Integer;
    function ForDownto(AFrom, ATo: Integer): Integer;
    function CaseRanges(ARoll: Integer): string;
    function ExceptHandlers(const AText: string): Integer;
    function BareExcept(AValue: Integer): Integer;
    function TryFinally(AList: TStrings): Integer;
    function BooleanOperators(AFirst, ASecond, AThird: Boolean): Boolean;
    function BitwiseOperators(AMask, AFlags: Integer): Integer;
    function NestedRoutines(AValue: Integer): Integer;
    function AnonymousMethods(AValues: TList<Integer>): Integer;
    function Hit(ARoll: Integer): Integer; overload;
    function Hit(ARoll: Integer; const AWeapon: string): Integer; overload;
    function WithDefaults(ARoll: Integer; ABonus: Integer = 2; const AName: string = 'centaur'): Integer;
    procedure ParameterGroups(AFirst, ASecond: Integer; var AThird, AFourth: string; out AFifth: Boolean;
      const ASixth: Double);
    function OpenArrays(const AValues: array of Integer; const AArguments: array of const): Integer;
    procedure UntypedParameters(var ABuffer; ASize: Integer);
    function IfdefBranches(AValue: Integer): Integer;
    function DirectiveExpression: Integer;
    function WithStatement(ACreature: TCreature): Integer;
    function GotoLabel(ALimit: Integer): Integer;
    function CommentSyntaxes: string;
    function KeywordsInStrings: string;
    function ParenlessChain(ACreature: TCreature): string;
    function TypeCheck(AFighter: TObject): Boolean;
    function SafeCast(AObject: TObject): Integer;
    function HardCast(AObject: TObject): Boolean;
    property Difficulty: Integer read GetDifficulty write SetDifficulty;
  end;

procedure Announce(const AArmor: TArmorClass);

var
  LastHitPoints: THitPoints;

implementation

uses
  System.Math,
  de.sots.cellarsandcentaurs.domain.model.Centaur,
  de.sots.cellarsandcentaurs.domain.model.Herd,
  de.sots.cellarsandcentaurs.domain.model.Lair,
  de.sots.cellarsandcentaurs.domain.model.CreatureId;

{$I EncounterRules.inc}

function GetTickCount: Cardinal; stdcall; external 'kernel32.dll';

function ForwardDeclared(AValue: Integer): Integer; forward;

procedure Announce(const AArmor: TArmorClass);
begin
  Writeln(ForwardDeclared(AArmor.Total));
end;

function ForwardDeclared(AValue: Integer): Integer;
begin
  Result := AValue + Integer(GetTickCount);
end;

class operator TModifier.Add(const ALeft, ARight: TModifier): TModifier;
begin
  Result.Value := ALeft.Value + ARight.Value;
end;

class operator TModifier.Implicit(AValue: Integer): TModifier;
begin
  Result.Value := AValue;
end;

function TRollHelper.IsCritical: Boolean;
begin
  Result := Self = 20;
end;

function TEncounterQueue<T>.Pick(const AItems: TArray<T>; AIndex: Integer): T;
begin
  Result := AItems[AIndex];
end;

class constructor TEncounterEdgeCases.Create;
begin
  FInstances := 0;
end;

constructor TEncounterEdgeCases.Create(ADifficulty: Integer);
begin
  inherited Create;
  FDifficulty := ADifficulty;
  FResolver := TEncounterResolver.Create;
end;

destructor TEncounterEdgeCases.Destroy;
begin
  FResolver.Free;
  inherited;
end;

class function TEncounterEdgeCases.Instances: Integer;
begin
  Result := FInstances;
end;

class procedure TEncounterEdgeCases.Reset;
begin
  FInstances := 0;
end;

function TEncounterEdgeCases.GetDifficulty: Integer;
begin
  Result := FDifficulty;
end;

procedure TEncounterEdgeCases.SetDifficulty(const AValue: Integer);
begin
  if AValue <> FDifficulty then
    FDifficulty := AValue;
end;

function TEncounterEdgeCases.RepeatUntil(ACount: Integer): Integer;
begin
  Result := 0;
  repeat
    Inc(Result);
  until Result >= ACount;
end;

function TEncounterEdgeCases.ForIn(ACreatures: TList<TCreature>): Integer;
var
  Current: TCreature;
begin
  Result := 0;
  for Current in ACreatures do
    Inc(Result, Current.XPValue);
end;

function TEncounterEdgeCases.ForDownto(AFrom, ATo: Integer): Integer;
var
  Index: Integer;
begin
  Result := 0;
  for Index := AFrom downto ATo do
    Inc(Result, Index);
end;

function TEncounterEdgeCases.CaseRanges(ARoll: Integer): string;
begin
  case ARoll of
    1:
      Result := 'fumble';
    2..5:
      Result := 'miss';
    6, 7, 8:
      Result := 'graze';
    9..12, 15:
      Result := 'hit';
  else
    Result := 'critical';
  end;
end;

function TEncounterEdgeCases.ExceptHandlers(const AText: string): Integer;
begin
  try
    Result := StrToInt(AText);
  except
    on E: EConvertError do
      Result := 0;
    on EOverflow do
      Result := MaxInt;
    else
      Result := -1;
  end;
end;

function TEncounterEdgeCases.BareExcept(AValue: Integer): Integer;
begin
  try
    Result := 100 div AValue;
  except
    Result := 0;
  end;
end;

function TEncounterEdgeCases.TryFinally(AList: TStrings): Integer;
begin
  AList.BeginUpdate;
  try
    Result := AList.Count;
  finally
    AList.EndUpdate;
  end;
end;

function TEncounterEdgeCases.BooleanOperators(AFirst, ASecond, AThird: Boolean): Boolean;
begin
  Result := (AFirst and ASecond) or (AThird and not AFirst) xor ASecond;
end;

function TEncounterEdgeCases.BitwiseOperators(AMask, AFlags: Integer): Integer;
begin
  Result := (AMask and AFlags) or (AMask shl 2);
end;

function TEncounterEdgeCases.NestedRoutines(AValue: Integer): Integer;

  procedure Bump;

    function Twice(AInput: Integer): Integer;
    begin
      Result := AInput * 2;
    end;

  begin
    AValue := Twice(AValue) + 1;
  end;

begin
  Bump;
  Result := AValue;
end;

function TEncounterEdgeCases.AnonymousMethods(AValues: TList<Integer>): Integer;
var
  Clamp: TFunc<Integer, Integer>;
  Report: TProc;
  Total: Integer;
begin
  Clamp := function(AValue: Integer): Integer
    begin
      if AValue > 20 then
        Exit(20);
      Result := AValue;
    end;
  Report := procedure
    begin
      while Total > 100 do
        Dec(Total, Length(TCreatureId.NewId.Value));
    end;
  Total := Clamp(AValues.Count);
  Report();
  Result := Total;
end;

function TEncounterEdgeCases.Hit(ARoll: Integer): Integer;
begin
  Result := Hit(ARoll, 'club');
end;

function TEncounterEdgeCases.Hit(ARoll: Integer; const AWeapon: string): Integer;
begin
  Result := ARoll + Length(AWeapon);
end;

/// <summary>
///   XML documentation comment, the form the Delphi IDE shows as Help Insight.
/// </summary>
function TEncounterEdgeCases.WithDefaults(ARoll: Integer; ABonus: Integer; const AName: string): Integer;
begin
  Result := ARoll + ABonus + Length(AName);
end;

{** PasDoc comment in braces,
    spread over two lines. }
procedure TEncounterEdgeCases.ParameterGroups(AFirst, ASecond: Integer; var AThird, AFourth: string;
  out AFifth: Boolean; const ASixth: Double);
begin
  AThird := IntToStr(AFirst);
  AFourth := IntToStr(ASecond);
  AFifth := ASixth > 0;
end;

(** PasDoc comment in parenthesis-star form,
    with a middle line
    and a third one. *)
function TEncounterEdgeCases.OpenArrays(const AValues: array of Integer; const AArguments: array of const): Integer;
begin
  Result := Length(AValues) + Length(AArguments);
end;

procedure TEncounterEdgeCases.UntypedParameters(var ABuffer; ASize: Integer);
begin
  FillChar(ABuffer, ASize, 0);
end;

function TEncounterEdgeCases.IfdefBranches(AValue: Integer): Integer;
begin
  Result := AValue;
{$IFDEF DEBUG}
  if Result > 10 then
    Result := 10;
{$ELSE}
  while Result > 10 do
    Dec(Result);
{$ENDIF}
end;

function TEncounterEdgeCases.DirectiveExpression: Integer;
begin
{$IF Defined(MSWINDOWS) and Defined(CPUX64)}
  Result := 64;
{$ELSE}
  Result := 32;
{$IFEND}
end;

function TEncounterEdgeCases.WithStatement(ACreature: TCreature): Integer;
begin
  with ACreature do
    Result := XPValue;
end;

function TEncounterEdgeCases.GotoLabel(ALimit: Integer): Integer;
label
  Retry;
begin
  Result := 0;
Retry:
  Inc(Result);
  if Result < ALimit then
    goto Retry;
end;

function TEncounterEdgeCases.CommentSyntaxes: string;
begin
  // line comment with a { brace and a (* parenthesis star
  { brace comment with // slashes and (* a nested parenthesis star *) inside }
  (* parenthesis star comment with { braces } and // slashes inside *)
  Result := '// not a comment' + '{ not a comment }' + '(* neither *)';
  Result := Result + 'it''s { still a string'; { trailing brace comment }
  Result := Result + ''''; (* trailing parenthesis star comment *)
end;

function TEncounterEdgeCases.KeywordsInStrings: string;
begin
  Result := 'if roll > 10 and armor < 5 or while case of repeat until';
end;

function TEncounterEdgeCases.ParenlessChain(ACreature: TCreature): string;
begin
  Result := ACreature.ClassName.Trim.ToLower.ToUpper.Trim;
end;

function TEncounterEdgeCases.TypeCheck(AFighter: TObject): Boolean;
begin
  Result := AFighter is TCentaur;
end;

function TEncounterEdgeCases.SafeCast(AObject: TObject): Integer;
begin
  Result := (AObject as THerd).Count;
end;

function TEncounterEdgeCases.HardCast(AObject: TObject): Boolean;
begin
  Result := TLair(AObject).IsFull;
end;

initialization
  if DebugHook <> 0 then
    Randomize;

finalization
  LastHitPoints := Default(THitPoints);

end.
