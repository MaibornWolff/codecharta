unit Game.User;

interface

uses SysUtils, Game.Text;

type
  TUser = class
    Error: Exception;
    function Size(const Text: string): Integer;
  end;

implementation

function TUser.Size(const Text: string): Integer;
begin
  Result := Length(Text) + StrToInt('1');
end;

end.
