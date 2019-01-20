import {AttributeType, CodeMap, CodeMapNode, Edge, Exclude} from "../data/model/CodeMap";


export class MultipleFileService {

    public static SELECTOR = "multipleFileService";
    private projectNameArray = [];
    private fileNameArray = [];
    private edges: Edge[] = [];
    private blacklist: Exclude[] = [];
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
            this.setConvertedBlacklist(inputMap);
        }
        return this.getNewAggregatedMap(inputMaps);
    }

    private setConvertedEdges(inputMap) {
        if(!inputMap.edges) return;

        for(let oldEdge of inputMap.edges){
            let edge: Edge = {
                fromNodeName: this.getUpdatedPath(inputMap.fileName, oldEdge.fromNodeName),
                toNodeName: this.getUpdatedPath(inputMap.fileName, oldEdge.toNodeName),
                attributes:  oldEdge.attributes,
                visible: oldEdge.visible
            };
            const equalEdgeItems = this.edges.filter(e => e.fromNodeName == edge.fromNodeName && e.toNodeName == edge.toNodeName);
            if(equalEdgeItems.length == 0) {
                this.edges.push(edge);
            }
        }
    }

    private setConvertedBlacklist(inputMap) {
        if(!inputMap.blacklist) return;

        for(let oldBlacklistItem of inputMap.blacklist){
            let blacklistItem: Exclude = {
                path: this.getUpdatedBlacklistItemPath(inputMap.fileName, oldBlacklistItem.path),
                type: oldBlacklistItem.type
            };
            const equalBlacklistItems = this.blacklist.filter(b => b.path == blacklistItem.path && b.type == blacklistItem.type);
            if(equalBlacklistItems.length == 0) {
                this.blacklist.push(blacklistItem);
            }
        }
    }

    private getUpdatedBlacklistItemPath(fileName, path) {
        if (path.substring(0,6) == "/root/") {
            return this.getUpdatedPath(fileName, path);
        }
        return path;
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
            blacklist: this.blacklist,
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
            outputNode.path = this.getUpdatedPath(inputCodeMap.fileName, inputCodeMap.root.path);
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
                children[i].path = this.getUpdatedPath(fileName, children[i].path);
            }

            if(children[i].children) {
                this.updatePathOfAllChildren(fileName, children[i].children);
            }
        }
    }

    private getUpdatedPath(fileName, path) {
        const subPath = path.substring(6, path.length);
        const slash = (subPath.length > 0) ? "/" : "";
        return "/root/" + fileName + slash + subPath;
    }
}