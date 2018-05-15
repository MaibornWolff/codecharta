import {Settings} from "../../core/settings/settings.service";
import {DataModel} from "../data/data.service";
import {node} from "../../ui/codeMap/rendering/node";
import {DialogService} from "../../ui/dialog/dialog.service";
import {CodeMap, CodeMapNode} from "../data/model/CodeMap";
import Code = marked.Tokens.Code;


export class AggregateMapService {

    public static SELECTOR = "aggregateMapService";

    constructor(private dialogService: DialogService) {
    }

    /*
     *
     *
     *
     */
    public aggregateMaps(inputMaps: CodeMap[]): CodeMap {

        if(inputMaps.length == 1) return inputMaps[0];

        let outputMap: CodeMap = {} as CodeMap;
        let projectNameArray = [];
        let fileNameArray = [];

        for(let inputMap of inputMaps){
            projectNameArray.push(inputMap.projectName);
            fileNameArray.push(inputMap.fileName);
        }

        outputMap.projectName = "Aggregation of following projects: " + projectNameArray.join(", ");
        outputMap.fileName = "Aggregation of following files: " + fileNameArray.join(", ");

        outputMap.root = {} as CodeMapNode;
        outputMap.root.name = "root";
        outputMap.root.children = [] as CodeMapNode[];

        console.log("outputMap", outputMap);

        for(let inputMap of inputMaps){
            outputMap.root.children.push(this.convertMapToNode(inputMap));
        }

        console.log("outputMap",outputMap);


        return outputMap;
    }

    convertMapToNode(inputCodeMap: CodeMap): CodeMapNode{
        let outputNode: CodeMapNode = {
            name: inputCodeMap.projectName,
            children: inputCodeMap.root.children,
            attributes: inputCodeMap.root.attributes,
            deltas: inputCodeMap.root.deltas,
            link: inputCodeMap.root.link,
            origin: inputCodeMap.root.origin,
            visible: inputCodeMap.root.visible,
            path: inputCodeMap.projectName+"/"+inputCodeMap.root.path
        } ;
        return outputNode;
    }
}
/*
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
    origin?: string,
    visible?: boolean,
    path?:string
}

export interface CodeMap {

    fileName: string,
    projectName: string,
    root: CodeMapNode,
    dependencies?: CodeMapDependency[]

}
*/