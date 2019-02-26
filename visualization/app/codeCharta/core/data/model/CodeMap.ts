export interface CodeMapNode {
    name: string;
    type: string;
    children?: CodeMapNode[];
    attributes: KeyValuePair;
    deltas?: KeyValuePair;
    link?: string;
    origin?: string;
    visible?: boolean;
    path?: string;
}

export interface CodeMap {
    fileName: string;
    apiVersion?: string;
    projectName: string;
    nodes: CodeMapNode;
    edges?: Edge[];
    attributeTypes?: AttributeTypes;
    blacklist?: Array<BlacklistItem>;
}

export interface Edge {
    fromNodeName: string;
    toNodeName: string;
    attributes: KeyValuePair;
    visible?: boolean;
}

export interface AttributeTypes {
    nodes?: {
        [key: string]: AttributeType
    };
    edges?: {
        [key: string]: AttributeType
    };
}

export enum AttributeType {
    absolute, relative
}

export interface BlacklistItem {
    path: string;
    type: BlacklistType;
}

export enum BlacklistType {
    hide = "hide",
    exclude = "exclude"
}

export interface KeyValuePair {
    [key: string]: number;
}