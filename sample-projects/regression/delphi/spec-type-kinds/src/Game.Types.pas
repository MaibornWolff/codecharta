unit Game.Types;

interface

uses Game.Model;

type
  TEntity = TCreature;
  PCreature = ^TCreature;
  TCreatureClass = class of TCreature;
  TCreatureProc = procedure(Creature: TCreature);
  TColors = set of TColor;
  TCreatures = array of TCreature;

implementation

end.
