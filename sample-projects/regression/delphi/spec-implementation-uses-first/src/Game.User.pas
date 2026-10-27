unit Game.User;

interface

uses Game.A;

type
  TUser = class
    Item: TItem;
    procedure Run;
  end;

implementation

uses Game.B;

procedure TUser.Run;
var
  Other: TItem;
begin
  Other := nil;
end;

end.
