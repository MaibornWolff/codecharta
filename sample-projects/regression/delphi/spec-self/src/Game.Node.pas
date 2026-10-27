unit Game.Node;

interface

type
  TNode = class
    Next: TNode;
    function Clone: TNode;
  end;

implementation

function TNode.Clone: TNode;
begin
  Result := TNode.Create;
end;

end.
