import {KeyValuePair} from "../../../codeCharta.model";

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
    deltas : KeyValuePair;
    attributes : KeyValuePair;
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