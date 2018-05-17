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

    constructor(name: string) {
        this.name = name;
    }

    public calculateValue(key: string): number {
        let value = 0;
        if(this.children && this.children.length > 0){
            for (let i=0; i<this.children.length; i++) {
                value += this.children[i].calculateValue(key);
            }
        } else if(this.attributes && this.attributes[key]) {
            value += this.attributes[key];
        }
        return value;
    }

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