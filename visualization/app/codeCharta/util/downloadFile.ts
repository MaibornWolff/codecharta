import angular from "angular";
import * as d3 from "d3";
import {CCFile, CodeMapNode, Settings} from "../codeCharta.model";

export class DownloadFile {

    public static downloadCurrentMap(settings: Settings, file: CCFile) {
        const data = this.getProjectDataAsCCJsonFormat(settings, file);
        this.downloadData(data, this.getNewFileName(file));
    }

    private static getProjectDataAsCCJsonFormat(settings: Settings, file: CCFile) {
        let newFileName = this.getNewFileName(file);

        return {
            fileName: newFileName,
            projectName: file.fileMeta.projectName,
            apiVersion: file.fileMeta.apiVersion,
            nodes: [this.removeJsonHashkeysAndVisibleAttribute(file.map)],
            edges: settings.fileSettings.edges,
            attributeTypes: settings.fileSettings.attributeTypes,
            blacklist: settings.fileSettings.blacklist,
        };
    }

    private static removeJsonHashkeysAndVisibleAttribute(map: CodeMapNode) {
        let copy = JSON.parse(JSON.stringify(map));
        d3.hierarchy(copy).each((node)=>{
            delete node.data.visible;
        });
        return copy;
    }

    private static getNewFileName(file: CCFile) {
        const datedFileName = this.addDateToFileName(file.fileMeta.fileName);
        return this.addJsonFileEndingIfNecessary(datedFileName);
    }

    private static addDateToFileName(fileName) {
        const date = new Date();
        const dateString = date.getDate() + "_" + (date.getMonth() + 1)  + "_" + date.getFullYear();
        let tokens = fileName.split(".");
        tokens.splice(1, 0, dateString);
        return tokens.join(".");
    }

    private static addJsonFileEndingIfNecessary(fileName) {
        if(!fileName.endsWith(".json")) {
            return fileName + ".json";
        }
        return fileName;
    }

    private static downloadData(data, fileName) {
        let dataJson = data;
        if (typeof data === "object") {
            dataJson = angular.toJson(data, 4);
        }

        const blob = new Blob([dataJson], {type: "text/json"});
        const e = document.createEvent("MouseEvents");
        const a = document.createElement("a");

        a.download = fileName;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
        e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
    }

}
