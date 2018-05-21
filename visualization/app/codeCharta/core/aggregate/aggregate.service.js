"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AggregateMapService = /** @class */ (function () {
    function AggregateMapService(dialogService) {
        this.dialogService = dialogService;
    }
    AggregateMapService.prototype.aggregateMaps = function (inputMaps) {
        if (inputMaps.length == 1)
            return inputMaps[0];
        var projectNameArray = [];
        var fileNameArray = [];
        for (var _i = 0, inputMaps_1 = inputMaps; _i < inputMaps_1.length; _i++) {
            var inputMap = inputMaps_1[_i];
            projectNameArray.push(inputMap.projectName);
            fileNameArray.push(inputMap.fileName);
        }
        var outputMap = {};
        outputMap.projectName = "Aggregation of following projects: " + projectNameArray.join(", ");
        outputMap.fileName = "Aggregation of following files: " + fileNameArray.join(", ");
        outputMap.root = {};
        outputMap.root.name = "root";
        outputMap.root.children = [];
        outputMap.root.attributes = {};
        for (var _a = 0, inputMaps_2 = inputMaps; _a < inputMaps_2.length; _a++) {
            var inputMap = inputMaps_2[_a];
            outputMap.root.children.push(this.convertMapToNode(inputMap));
        }
        return outputMap;
    };
    AggregateMapService.prototype.convertMapToNode = function (inputCodeMap) {
        var outputNode = {};
        outputNode["name"] = inputCodeMap.projectName;
        for (var property in inputCodeMap.root) {
            if (property == "children") {
                outputNode[property] = JSON.parse(JSON.stringify(inputCodeMap.root.children));
            }
            else if (property == "path") {
                outputNode[property] = this.updatePath(inputCodeMap.projectName, inputCodeMap.root.path);
            }
            else if (property != "name") {
                outputNode[property] = inputCodeMap.root[property];
            }
        }
        this.updatePathOfAllChildren(inputCodeMap.projectName, outputNode.children);
        return outputNode;
    };
    AggregateMapService.prototype.updatePathOfAllChildren = function (projectName, children) {
        for (var i = 0; i < children.length; i++) {
            if (children[i].path) {
                children[i].path = this.updatePath(projectName, children[i].path);
            }
            if (children[i].children) {
                this.updatePathOfAllChildren(projectName, children[i].children);
            }
        }
    };
    AggregateMapService.prototype.updatePath = function (projectName, path) {
        var subPath = path.substring(6, path.length);
        var slash = (subPath.length > 0) ? "/" : "";
        return "/root/" + projectName + slash + subPath;
    };
    AggregateMapService.SELECTOR = "aggregateMapService";
    return AggregateMapService;
}());
exports.AggregateMapService = AggregateMapService;
