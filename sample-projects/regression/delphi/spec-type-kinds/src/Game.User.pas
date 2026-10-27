unit Game.User;

interface

uses Game.Types;

type
  TUser = class
    Entity: TEntity;
    Pointer: PCreature;
    Kind: TCreatureClass;
    Callback: TCreatureProc;
    Colors: TColors;
    All: TCreatures;
  end;

implementation

end.
