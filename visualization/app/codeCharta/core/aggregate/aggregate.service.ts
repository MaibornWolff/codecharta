import {Settings} from "../../core/settings/settings.service";
import {DataModel} from "../data/data.service";
import {node} from "../../ui/codeMap/rendering/node";
import {DialogService} from "../../ui/dialog/dialog.service";
import {CodeMap, CodeMapNode} from "../data/model/CodeMap";
import Code = marked.Tokens.Code;


export class AggregateMapService {


    public static SELECTOR = "statisticMapService";

    constructor(private dialogService: DialogService) {

    }

    /*
     *
     *
     *
     */
    aggregateMaps(inputMaps: CodeMap[]):CodeMap{
        if(inputMaps.length==1) return inputMaps[0];
        let outputMap: CodeMap;
        outputMap.projectName = "Aggregation of following projects:  ";
        outputMap.fileName = "Aggregation of following files:  ";
        for(let input in inputMaps){
            console.log(input);
            if(input.projectName){
                outputMap.projectName=outputMap.projectName.concat(input.projectName," ,");
            }if(input.fileName){
                outputMap.fileName=outputMap.fileName.concat(input.fileName," ,");
            }
        }
        outputMap.projectName=outputMap.projectName.substring(0,outputMap.projectName.length-2).concat(".");
        outputMap.fileName=outputMap.fileName.substring(0,outputMap.fileName.length-2).concat(".");
        outputMap.root = {} as CodeMapNode;
        outputMap.root.name = "root";
        outputMap.root.children ={} as CodeMapNode[];
        for(let input in inputMaps){
            outputMap.root.children.push(this.convertMapToNode(input));
        }
        return outputMap;
    }

    convertMapToNode(input: CodeMap): CodeMapNode{
        let output: CodeMapNode;
        //TODO
        return output;
    }
}