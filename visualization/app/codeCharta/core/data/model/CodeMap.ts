export interface CodeMapNode {
    name: string,
    children?: CodeMapNode[]
    attributes?: {
        [key: string]: number
    },
    deltas?: {
        [key: string]: number
    },
    link?: string,
    origin?: string
}

export interface CodeMap {

    fileName: string,
    projectName: string,
    root: CodeMapNode

}