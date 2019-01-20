import {AttributeType, CodeMap, CodeMapNode, Edge} from "../data/model/CodeMap";


export class MultipleFileService {

    public static SELECTOR = "multipleFileService";
    private projectNameArray = [];
    private fileNameArray = [];
    private edges: Edge[] = [];
    private attributeTypesEdge:{[key: string]: AttributeType} = {};
    private attributeTypesNode:{[key: string]: AttributeType} = {};

    constructor() {
    }

    public aggregateMaps(inputMaps: CodeMap[]): CodeMap {
        if(inputMaps.length == 1) return inputMaps[0];

        for(let inputMap of inputMaps){
            this.projectNameArray.push(inputMap.projectName);
            this.fileNameArray.push(inputMap.fileName);
            this.setConvertedEdges(inputMap);
            this.setAttributeTypesByUniqueKey(inputMap);
        }
        return this.getNewAggregatedMap(inputMaps);
    }

    private setConvertedEdges(inputMap) {
        if(!inputMap.edges) return;

        for(let currentEdge of inputMap.edges){
            let edge: Edge = {
                fromNodeName: this.getUpdatedPathName(inputMap.fileName, currentEdge.fromNodeName),
                toNodeName: this.getUpdatedPathName(inputMap.fileName, currentEdge.toNodeName),
                attributes:  currentEdge.attributes,
                visible: currentEdge.visible
            };
            this.edges.push(edge);
        }
    }

    private setAttributeTypesByUniqueKey(inputMap) {
        const types = inputMap.attributeTypes;
        if(types && types.edges && types.nodes){
            for(let key in types.edges){
                this.attributeTypesEdge[key] = types.edges[key];
            }
            for(let key in types.nodes){
                this.attributeTypesNode[key] = types.nodes[key];
            }
        }
    }

    private getNewAggregatedMap(inputMaps): CodeMap {
        let outputMap: CodeMap = {
            projectName: "Aggregation of following projects: " + this.projectNameArray.join(", "),
            fileName: "Aggregation of following files: " + this.fileNameArray.join(", "),
            root: {
                name: "root",
                type: "Folder",
                children: [] as CodeMapNode[],
                attributes: {},
                origin: "Aggregation of following files: " + this.fileNameArray.join(", "),
                path: "/root",
                visible: true
            },
            edges: this.edges,
            attributeTypes: {
                nodes: this.attributeTypesNode,
                edges: this.attributeTypesEdge
            }
        };

        for(let inputMap of inputMaps){
            outputMap.root.children.push(this.convertMapToNode(inputMap));
        }
        return outputMap;
    }

    private convertMapToNode(inputCodeMap: CodeMap): CodeMapNode {
        let outputNode: CodeMapNode = {
            name: inputCodeMap.fileName,
            children: JSON.parse(JSON.stringify(inputCodeMap.root.children))
        } as CodeMapNode;

        if (inputCodeMap.root.path) {
            outputNode.path = this.getUpdatedPathName(inputCodeMap.fileName, inputCodeMap.root.path);
        }

        for(let key in inputCodeMap.root){
            if(!["name", "path", "children"].includes(key)){
                outputNode[key] = inputCodeMap.root[key];
            }
        }
        this.updatePathOfAllChildren(inputCodeMap.fileName, outputNode.children);
        return outputNode;
    }

    private updatePathOfAllChildren(fileName, children: CodeMapNode[]) {
        for(let i = 0; i < children.length; i++) {
            if(children[i].path){
                children[i].path = this.getUpdatedPathName(fileName, children[i].path);
            }

            if(children[i].children) {
                this.updatePathOfAllChildren(fileName, children[i].children);
            }
        }
    }

    private getUpdatedPathName(fileName, path) {
        const subPath = path.substring(6, path.length);
        const slash = (subPath.length > 0) ? "/" : "";
        return "/root/" + fileName + slash + subPath;
    }
}