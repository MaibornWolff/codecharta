import {DialogService} from "../../ui/dialog/dialog.service";
import {CodeMap, CodeMapNode} from "../data/model/CodeMap";


export class AggregateMapService {

    public static SELECTOR = "aggregateMapService";

    constructor(private dialogService: DialogService) {
    }

    public aggregateMaps(inputMaps: CodeMap[]): CodeMap {

        if(inputMaps.length == 1) return inputMaps[0];

        let projectNameArray = [];
        let fileNameArray = [];

        for(let inputMap of inputMaps){
            projectNameArray.push(inputMap.projectName);
            fileNameArray.push(inputMap.fileName);
        }

        let outputMap: CodeMap = {} as CodeMap;
        outputMap.projectName = "Aggregation of following projects: " + projectNameArray.join(", ");
        outputMap.fileName = "Aggregation of following files: " + fileNameArray.join(", ");
        outputMap.root = {} as CodeMapNode;
        outputMap.root.name = "root";
        outputMap.root.children = [] as CodeMapNode[];

        for(let inputMap of inputMaps){
            outputMap.root.children.push(this.convertMapToNode(inputMap));
        }

        return outputMap;
    }

    private convertMapToNode(inputCodeMap: CodeMap): CodeMapNode{

        let outputNode: CodeMapNode = {
            name: inputCodeMap.projectName,
            children: JSON.parse(JSON.stringify(inputCodeMap.root.children)),
            attributes: inputCodeMap.root.attributes,
            deltas: inputCodeMap.root.deltas,
            link: inputCodeMap.root.link,
            origin: inputCodeMap.root.origin,
            visible: inputCodeMap.root.visible,
            path: this.updatePath(inputCodeMap.projectName, inputCodeMap.root.path),
        };

        this.updatePathOfAllChildren(inputCodeMap.projectName, outputNode.children);

        return outputNode;
    }

    private updatePathOfAllChildren(projectName, children: CodeMapNode[]) {
        for(let i = 0; i < children.length; i++) {
            children[i].path = this.updatePath(projectName, children[i].path);

            if(children[i].children) {
                this.updatePathOfAllChildren(projectName, children[i].children);
            }
        }
    }

    private updatePath(projectName, path) {
        let subPath = path.substring(6, path.length);
        let slash = (subPath.length > 0) ? "/" : "";
        return "/root/" + projectName + slash + subPath;
    }
}