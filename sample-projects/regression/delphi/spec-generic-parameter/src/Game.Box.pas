unit Game.Box;

interface

uses Game.Util;

type
  TBox<T: class> = class
    Item: T;
    Stat: TStat;
  end;

implementation

end.
