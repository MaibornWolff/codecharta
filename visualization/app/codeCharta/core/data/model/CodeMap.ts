export interface CodeMapNode {
    name: string;
    type: string;
    children?: CodeMapNode[];
    attributes: {
        [key: string]: number
    };
    deltas?: {
        [key: string]: number
    };
    link?: string;
    origin?: string;
    visible?: boolean;
    path?: string;
    markingColor?: string;
}

export interface CodeMap {
    fileName: string;
    apiVersion?: string;
    projectName: string;
    root: CodeMapNode;
    edges?: [Edge];
}

export interface Edge {
    fromNodeName: string;
    toNodeName: string;
    attributes: {
        [key: string]: number
    };
    visible?: boolean;
}