export interface nodeAttributes {
    readonly [key : string] : number;
}

export interface node {
    name : string;
    width : number;
    height : number;
    length : number;
    depth : number;
    x0 : number;
    z0 : number;
    y0 : number;
    isLeaf : boolean;
    deltas : nodeAttributes;
    attributes : nodeAttributes;
    children : node[];
    parent : node;
    heightDelta : number;
    visible : boolean;
    path : string;
    origin : string;
    link : string;
    markingColor: number;
}