import {AttributeType, CodeMap, CodeMapNode, Edge} from "../data/model/CodeMap";
import {DialogService} from "../../ui/dialog/dialog.service";
import {ColorKeywords} from "three";
import forestgreen = ColorKeywords.forestgreen;
import {forEachComment} from "tslint";


export class MultipleFileService {

    public static SELECTOR = "multipleFileService";

    constructor(private dialogService: DialogService) {

    }


    public aggregateMaps(inputMaps: CodeMap[]): CodeMap {

        if(inputMaps.length == 1) return inputMaps[0];

        let projectNameArray = [];
        let fileNameArray = [];
        let edges: Edge[];
        let attributeTypesEdge:{[key: string]: AttributeType} = {};
        let attributeTypesNode:{[key: string]: AttributeType} = {};

        for(let inputMap of inputMaps){
            projectNameArray.push(inputMap.projectName);
            fileNameArray.push(inputMap.fileName);
            if(inputMap.edges){
                if(!edges){
                    edges = [];
                }
                for(let currentEdge of inputMap.edges){
                    let edgeOnWork: Edge = {} as Edge;
                    edgeOnWork["fromNodeName"] = this.updatePath(inputMap.fileName, currentEdge.fromNodeName);
                    edgeOnWork["toNodeName"] = this.updatePath(inputMap.fileName, currentEdge.toNodeName );
                    edgeOnWork["attributes"] =  currentEdge.attributes;

                    if(currentEdge.visible ) {
                        edgeOnWork["visible"] = currentEdge.visible;
                    }
                    else if(edgeOnWork.hasOwnProperty("visible") ){
                        delete edgeOnWork["visible"];
                    }

                    edges.push(edgeOnWork);
                }
            }
            if(inputMap.attributeTypes && inputMap.attributeTypes.edges && inputMap.attributeTypes.nodes ){
                for(let key in inputMap.attributeTypes.edges){
                    attributeTypesEdge[key] = inputMap.attributeTypes.edges[key];
                }
                for(let key in inputMap.attributeTypes.nodes){
                    attributeTypesNode[key] = inputMap.attributeTypes.nodes[key];
                }
            }

        }

        let outputMap: CodeMap = {
            projectName: "Aggregation of following projects: " + projectNameArray.join(", "),
            fileName: "Aggregation of following files: " + fileNameArray.join(", "),
            root: {
                name: "root",
                type: "Folder",
                children: [] as CodeMapNode[],
                attributes: {},
                origin: "Aggregation of following files: " + fileNameArray.join(", "),
                path: "/root",
                visible: true
            }
        };
        if(edges){
            outputMap["edges"] = edges;
        }

        if(Object.keys(attributeTypesEdge).length != 0 && Object.keys(attributeTypesNode).length != 0  ){
            outputMap["attributeTypes"] = {
                nodes: attributeTypesNode,
                edges: attributeTypesEdge
            }
        }

        for(let inputMap of inputMaps){
            outputMap.root.children.push(this.convertMapToNode(inputMap));
        }
        return outputMap;
    }

    private convertMapToNode(inputCodeMap: CodeMap): CodeMapNode{

        let outputNode: CodeMapNode = {} as CodeMapNode;
        outputNode["name"]= inputCodeMap.fileName;

        for(let property in inputCodeMap.root){

            if(property == "children"){
                outputNode[property] = JSON.parse(JSON.stringify(inputCodeMap.root.children));
            }
            else if(property == "path"){
                outputNode[property] = this.updatePath(inputCodeMap.fileName, inputCodeMap.root.path);
            }
            else if(property != "name"){
                outputNode[property] =  inputCodeMap.root[property];
            }
        }

        this.updatePathOfAllChildren(inputCodeMap.fileName, outputNode.children);

        return outputNode;
    }

    private updatePathOfAllChildren(fileName, children: CodeMapNode[]) {
        for(let i = 0; i < children.length; i++) {
            if(children[i].path){
                children[i].path = this.updatePath(fileName, children[i].path);
            }

            if(children[i].children) {
                this.updatePathOfAllChildren(fileName, children[i].children);
            }
        }
    }

    private updatePath(fileName, path) {
        let subPath = path.substring(6, path.length);
        let slash = (subPath.length > 0) ? "/" : "";
        let pathName = "/root/" + fileName + slash + subPath;
        return pathName;
    }
}