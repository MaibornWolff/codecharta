unit MyCo.MyMod.Sample;

// Sample unit demonstrating Delphi language features.
// Used for golden file contract testing.

interface

uses
  SysUtils, Classes, Generics.Collections;

type
  // Forward-declared interface
  ISampleProcessor = interface
    function Process(const Input: string): string;
  end;

  { Status enum declaration }
  TStatus = (Pending, Active, Completed);

  (* Simple record type *)
  TPoint = record
    X, Y: Integer;
  end;

  TSample = class(TObject, ISampleProcessor)
  strict private
    FPrefix: string;
    FCounter: Integer;
    FItems: TStringList;
  public
    constructor Create(const APrefix: string = 'Hello, ');
    destructor Destroy; override;
    function GetCounter: Integer;
    function Calculate(A, B, C, D, E: Integer): Integer;
    function ProcessData(Items: TStrings): string;
    function Process(const Input: string): string;
  end;

  TStringsHelper = class helper for TStrings
    function FirstOrEmpty: string;
  end;

  TOuter = class
  public type
    TInner = class
      FValue: Integer;
    end;
  end;

implementation

uses
  Math;

constructor TSample.Create(const APrefix: string);
begin
  FPrefix := APrefix;
  FCounter := 0;
  FItems := TStringList.Create;
end;

destructor TSample.Destroy;
begin
  FItems.Free;
  inherited;
end;

function TSample.GetCounter: Integer;
begin
  Result := FCounter;
end;

function TSample.Calculate(A, B, C, D, E: Integer): Integer;
var
  i, Sum: Integer;
begin
  if (A < 0) or (B < 0) then
  begin
    Result := 0;
    Exit;
  end;
  Sum := 0;
  for i := 1 to C do
    Sum := Sum + A + B;
  while D > 0 do
  begin
    Sum := Sum + D;
    D := D - 1;
  end;
  Result := Sum + E;
end;

function TSample.ProcessData(Items: TStrings): string;
var
  i, Count: Integer;
  Item: string;
  Builder: TStringBuilder;
begin
  Builder := TStringBuilder.Create;
  try
    Count := 0;
    for i := 0 to Items.Count - 1 do
    begin
      Item := Items[i];
      if Item = '' then
        Continue;
      if Length(Item) > 10 then
        Builder.Append(Copy(Item, 1, 5))
      else
        Builder.Append(Item);
      Count := Count + 1;
    end;
    try
      Builder.Append(' total: ');
      Builder.Append(Count);
    except
      on E: Exception do
        Result := 'error';
    end;
    Result := Builder.ToString;
  finally
    Builder.Free;
  end;
end;

function TSample.Process(const Input: string): string;
begin
  case Length(Input) of
    0: Result := 'empty';
    1..5: Result := 'short';
    6..20: Result := 'medium';
  else
    Result := 'long';
  end;
end;

function TStringsHelper.FirstOrEmpty: string;
begin
  if Self.Count > 0 then
    Result := Self[0]
  else
    Result := '';
end;

end.
