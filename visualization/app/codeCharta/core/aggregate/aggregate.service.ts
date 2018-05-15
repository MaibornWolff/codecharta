import {Settings} from "../../core/settings/settings.service";
import {DataModel} from "../data/data.service";
import {node} from "../../ui/codeMap/rendering/node";
import {DialogService} from "../../ui/dialog/dialog.service";
import {CodeMap, CodeMapNode} from "../data/model/CodeMap";
import Code = marked.Tokens.Code;


export class AggregateMapService {

    public static SELECTOR = "aggregateMapService";

    constructor(private dialogService: DialogService) {
        console.log("hi");
    }

    /*
     *
     *
     *
     */
    public aggregateMaps(inputMaps: CodeMap[]): CodeMap {

        console.log("hi2");

        if(inputMaps.length == 1) return inputMaps[0];

        let outputMap: CodeMap = {} as CodeMap;
        let projectNameArray = [];
        let fileNameArray = [];

        for(let inputMap of inputMaps){
            projectNameArray.push(inputMap.projectName);
            fileNameArray.push(inputMap.fileName);
        }

        outputMap.projectName = "Aggregation of following projects:  " + projectNameArray.join(", ").concat(".");
        outputMap.fileName = "Aggregation of following files:  " + fileNameArray.join(", ").concat(".");

        outputMap.root = {} as CodeMapNode;
        outputMap.root.name = "root";
        outputMap.root.children = {} as CodeMapNode[];

        console.log("outputMap", outputMap);

        for(let inputMap of inputMaps){
            //outputMap.root.children.push(this.convertMapToNode(inputMap));
        }



        return outputMap;
    }

    convertMapToNode(input: CodeMap): CodeMapNode{
        let output: CodeMapNode;
        //TODO
        return output;
    }
}