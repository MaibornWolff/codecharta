"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AggregateMapService = /** @class */ (function () {
    function AggregateMapService() {
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
        var outputMap = {
            projectName: "Aggregation of following projects: " + projectNameArray.join(", "),
            fileName: "Aggregation of following files: " + fileNameArray.join(", "),
            root: {
                name: "root",
                children: [],
                attributes: {}
            }
        };
        for (var _a = 0, inputMaps_2 = inputMaps; _a < inputMaps_2.length; _a++) {
            var inputMap = inputMaps_2[_a];
            outputMap.root.children.push(this.convertMapToNode(inputMap));
        }
        return outputMap;
    };
    AggregateMapService.prototype.convertMapToNode = function (inputCodeMap) {
        var outputNode = {};
        outputNode["name"] = inputCodeMap.fileName;
        for (var property in inputCodeMap.root) {
            if (property == "children") {
                outputNode[property] = JSON.parse(JSON.stringify(inputCodeMap.root.children));
            }
            else if (property == "path") {
                outputNode[property] = this.updatePath(inputCodeMap.fileName, inputCodeMap.root.path);
            }
            else if (property != "name") {
                outputNode[property] = inputCodeMap.root[property];
            }
        }
        this.updatePathOfAllChildren(inputCodeMap.fileName, outputNode.children);
        return outputNode;
    };
    AggregateMapService.prototype.updatePathOfAllChildren = function (fileName, children) {
        for (var i = 0; i < children.length; i++) {
            if (children[i].path) {
                console.log("children: " + children[i].path);
                children[i].path = this.updatePath(fileName, children[i].path);
            }
            if (children[i].children) {
                this.updatePathOfAllChildren(fileName, children[i].children);
            }
        }
    };
    AggregateMapService.prototype.updatePath = function (fileName, path) {
        console.log("path: " + path);
        var subPath = path.substring(6, path.length);
        var slash = (subPath.length > 0) ? "/" : "";
        var pathName = "/root/" + fileName + slash + subPath;
        console.log("updated path: " + pathName);
        return pathName;
    };
    AggregateMapService.SELECTOR = "aggregateMapService";
    return AggregateMapService;
}());
exports.AggregateMapService = AggregateMapService;
