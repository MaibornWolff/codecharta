unit DelphiSample;

{ Delphi sample unit demonstrating common metric-bearing constructs. }

interface

procedure Greet(const Name: string);
function Sum(Values: array of Integer): Integer;

implementation

// Greets the user by printing a friendly message.
procedure Greet(const Name: string);
begin
  if Name = '' then
    WriteLn('Hello, world!')
  else
    WriteLn('Hello, ' + Name + '!');
end;

(* Sums the elements of an integer array. *)
function Sum(Values: array of Integer): Integer;
var
  I: Integer;
begin
  Result := 0;
  for I := Low(Values) to High(Values) do
    Result := Result + Values[I];
end;

end.
