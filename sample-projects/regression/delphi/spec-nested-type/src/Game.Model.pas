unit Game.Model;

interface

uses Game.Base;

type
  TOuter = class
  public type
    TInner = class
      Stat: TStat;
    end;
  public
    Inner: TInner;
  end;

implementation

end.
