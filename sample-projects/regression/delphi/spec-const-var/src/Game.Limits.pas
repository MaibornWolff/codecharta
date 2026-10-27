unit Game.Limits;

interface

uses Game.Model;

const
  MaxHp = 100;
  NoBoss: TCreature = nil;

resourcestring
  SName = 'name';

var
  Current: TCreature;

threadvar
  PerThread: Integer;

implementation

end.
