export interface NodeAttributes {
    readonly [key : string] : number;
}

export interface Node {
    name : string;
    width : number;
    height : number;
    length : number;
    depth : number;
    x0 : number;
    z0 : number;
    y0 : number;
    isLeaf : boolean;
    deltas : NodeAttributes;
    attributes : NodeAttributes;
    children : Node[];
    parent : Node;
    heightDelta : number;
    visible : boolean;
    path : string;
    origin : string;
    link : string;
    markingColor: string;
    flat: boolean;
}