unit Game.Swap;

interface

procedure SwapBytes(Value: PWord);
procedure Report;

implementation

uses Game.Helper;

procedure SwapBytes(Value: PWord);
{$IFDEF HAS_INTRINSICS}
begin
  while Value^ <> 0 do
  begin
    Value^ := Swap(Value^);
    Inc(Value);
  end;
{$ELSE}
asm
       MOV     ESI, EAX
@@1:
       LODSW
       XCHG    AL, AH
{$ENDIF}
end;

procedure Report;
begin
  THelper.Run;
end;

end.
