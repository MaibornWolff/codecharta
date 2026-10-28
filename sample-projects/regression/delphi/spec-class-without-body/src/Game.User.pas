unit Game.User;

interface

uses Game.Errors;

type
  TUser = class
    procedure Check;
  end;

implementation

procedure TUser.Check;
begin
  raise EFail.Create;
end;

end.
