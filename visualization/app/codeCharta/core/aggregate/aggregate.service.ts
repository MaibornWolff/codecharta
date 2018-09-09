import {AttributeType, CodeMap, CodeMapNode} from "../data/model/CodeMap";
import {DialogService} from "../../ui/dialog/dialog.service";


export class AggregateMapService {

    public static SELECTOR = "aggregateMapService";

    constructor(private dialogService: DialogService) {

    }


    public aggregateMaps(inputMaps: CodeMap[]): CodeMap {

        if(inputMaps.length == 1) return inputMaps[0];

        let projectNameArray = [];
        let fileNameArray = [];
        let AttributeTypesEdge:{[key: string]: AttributeType} = {};
        let AttributeTypesNode:{[key: string]: AttributeType} = {};
        console.log("Before");

        for(let inputMap of inputMaps){
            projectNameArray.push(inputMap.projectName);
            fileNameArray.push(inputMap.fileName);
            for(let key in inputMap.attributeTypes.edges){
                console.log(key);
                console.log(inputMap.attributeTypes.edges[key]);
                AttributeTypesEdge[key] = inputMap.attributeTypes.edges[key];
            }
            for(let key in inputMap.attributeTypes.nodes){
                console.log(key);
                console.log(inputMap.attributeTypes.nodes[key]);
                AttributeTypesNode[key] = inputMap.attributeTypes.nodes[key];
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


        if(Object.keys(AttributeTypesEdge).length != 0 && Object.keys(AttributeTypesNode).length != 0  ){
            outputMap["attributeTypes"] = {
                nodes: AttributeTypesNode,
                edges: AttributeTypesEdge
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