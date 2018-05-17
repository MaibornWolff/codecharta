export class CodeMapNode {
    public name: string;
    public children?: CodeMapNode[];
    public attributes?: {
        [key: string]: number
    };
    public deltas?: {
        [key: string]: number
    };
    public link?: string;
    public origin?: string;
    public visible?: boolean;
    public path?: string;
}

export interface CodeMap {

    fileName: string,
    projectName: string,
    root: CodeMapNode,
    dependencies?: CodeMapDependency[]

}

export interface CodeMapDependency {
    node: string,
    dependsOn: string
}