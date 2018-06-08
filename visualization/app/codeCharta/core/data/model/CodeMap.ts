export interface CodeMapNode {
    name: string,
    children?: CodeMapNode[]
    attributes: {
        [key: string]: number
    },
    deltas?: {
        [key: string]: number
    },
    link?: string,
    origin?: string,
    visible?: boolean,
    path?:string
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
    dependsOn: string
}