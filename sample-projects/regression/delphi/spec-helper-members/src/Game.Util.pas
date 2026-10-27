unit Game.Util;

interface

function Name: string;
function Upper(const Text: string): string;

implementation

function Name: string;
begin
  Result := 'util';
end;

function Upper(const Text: string): string;
begin
  Result := Text;
end;

end.
