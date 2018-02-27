export interface nodeAttributes {
    readonly [key : string] : number;
}

export interface node {
    readonly name : string;
    readonly width : number;
    readonly height : number;
    readonly length : number;
    readonly depth : number;
    readonly x0 : number;
    readonly z0 : number;
    readonly y0 : number;
    readonly isLeaf : boolean;
    readonly deltas : nodeAttributes;
    readonly attributes : nodeAttributes;
    readonly children : node[];
    readonly parent : node;
    readonly isDelta : boolean;
    readonly heightDelta : number;
}