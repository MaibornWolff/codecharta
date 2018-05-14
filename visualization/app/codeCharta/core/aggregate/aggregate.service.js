export class AggregateMapService {
    constructor(dialogService) {
        this.dialogService = dialogService;
    }
    aggregateMaps(inputMaps) {
        if (inputMaps.length == 1)
            return inputMaps[0];
        let outputMap;
        outputMap.projectName = "Aggregation of following projects:  ";
        outputMap.fileName = "Aggregation of following files:  ";
        for (let input in inputMaps) {
            if (input.projectName) {
                outputMap.projectName = outputMap.projectName.concat(input.projectName, " ,");
            }
            if (input.fileName) {
                outputMap.fileName = outputMap.fileName.concat(input.fileName, " ,");
            }
        }
        outputMap.projectName = outputMap.projectName.substring(0, outputMap.projectName.length - 2).concat(".");
        outputMap.fileName = outputMap.fileName.substring(0, outputMap.fileName.length - 2).concat(".");
        outputMap.root = new CodeMapNode();
        outputMap.root.name = "root";
        outputMap.root.children = [];
        for (let input in inputMaps) {
            outputMap.root.children.push(convertMapToNode(input));
        }
        return outputMap;
    }
}
AggregateMapService.SELECTOR = "statisticMapService";
//# sourceMappingURL=aggregate.service.js.map