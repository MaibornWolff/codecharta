export interface CodeMapNode {
    name: string,
    children?: CodeMapNode[]
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

    fileName: string,
    projectName: string,
    root: CodeMapNode,
    dependencies?: {
        static?: CodeMapDependency[],
        temporal_coupling?: CodeMapDependency[]
    }

}

export interface CodeMapDependency {
    node: string,
    nodeFilename?: string,
    dependantNode: string,
    dependantNodeFilename?: string,
    pairingRate?: number,
    averageRevs?: number
    visible: boolean
}