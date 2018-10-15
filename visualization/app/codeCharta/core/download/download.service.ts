import { SettingsService, Settings } from "../settings/settings.service";
import angular from "angular";
import { CodeMap, CodeMapNode } from "../data/model/CodeMap";
import * as d3 from "d3";

export class DownloadService {

    public static SELECTOR = "downloadService";

    /* @ngInject */
    constructor(private settingsService: SettingsService) {
    }

    private addDateToFileName(fileName) {
        const date = new Date();
        const dateString = date.getDate() + "_" + (date.getMonth() + 1)  + "_" + date.getFullYear();
        let tokens = fileName.split(".");
        tokens.splice(1, 0, dateString);
        return tokens.join(".");
    }

    private addJsonFileEndingIfNecessary(fileName) {
        if(!fileName.endsWith(".json")) {
            return fileName + ".json";
        }
        return fileName;
    }

    private removeVisibleAttribute(root: CodeMapNode) {
        let copy = JSON.parse(JSON.stringify(root));
        d3.hierarchy(copy).each((node)=>{
            delete node.data.visible;
        });
        return copy;
    }

    public downloadCurrentMap() {
        var settings: Settings = this.settingsService.settings;
        var map: CodeMap = settings.map;

        const datedFileName = this.addDateToFileName(map.fileName);
        const resultingFileName = this.addJsonFileEndingIfNecessary(datedFileName);

        let data = {
            fileName: resultingFileName,
            projectName: map.projectName,
            apiVersion: map.apiVersion,
            nodes: [this.removeVisibleAttribute(map.root)],
            edges: map.edges,
            attributeTypes: map.attributeTypes,
            blacklist: settings.blacklist,
        };
        this.downloadData(data, resultingFileName);
    }

    private downloadData(data, fileName) {
        if (typeof data === "object") {
            data = angular.toJson(data, 4);
        }

        const blob = new Blob([data], {type: "text/json"});
        const e = document.createEvent("MouseEvents");
        const a = document.createElement("a");

        a.download = fileName;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
        e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
    }

}