unit Game.Arena;

interface

uses Game.Model;

type
  TList<T> = class
  end;
  TPool<T: TRule> = class
  end;
  TArena = class(TBase, IStrong)
  private
    FArmor: TArmor;
  public
    property Armor: TArmor read FArmor;
    function Move(Speed: TSpeed): THp;
    procedure Loot;
  end;

const
  NoName: TName = nil;

implementation

function TArena.Move(Speed: TSpeed): THp;
begin
  Result := nil;
end;

procedure TArena.Loot;
var
  Bag: TList<TLoot>;
  Trap: TTrap;
begin
  Bag := nil;
  Trap := nil;
end;

end.
