unit Game.Entity;

interface

uses Game.Mapping;

type
  [Table]
  TEntity = class
  public
    [ColumnAttribute]
    Name: string;
  end;

implementation

end.
