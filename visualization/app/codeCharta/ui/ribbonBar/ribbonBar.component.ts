import "./ribbonBar.component.scss";
import $ from "jquery";
import {SettingsService} from "../../core/settings/settings.service";

export class RibbonBarController {

    private collapsingElements = $("code-map-component #codeMap, ribbon-bar-component #header, ribbon-bar-component .section-body, #toggle-ribbon-bar-fab");

    private isExpanded: boolean = false;

    /* @ngInject */
    constructor(
        private settingsService: SettingsService
    ) {
    }

    public changeMargin(){
        this.settingsService.settings.dynamicMargin = false;
        this.settingsService.applySettings();
    }

    toggle() {
        if (!this.isExpanded) {
            this.expand();
        } else {
            this.collapse();
        }
    }

    public expand() {
        this.isExpanded = true;
        this.collapsingElements.addClass("expanded");
    }

    public collapse() {
        this.isExpanded = false;
        this.collapsingElements.removeClass("expanded");
    }

    addDateToFileName(fileName) {
        const date = new Date();
        const dateString = date.getDate() + "_" + (date.getMonth() + 1)  + "_" + date.getFullYear();
        let tokens = fileName.split(".");
        tokens.splice(1, 0, dateString);
        return tokens.join(".");
    }

    addJsonFileEndingIfNecessary(fileName) {
        if(!fileName.endsWith(".json")) {
            return fileName + ".json";
        }
        return fileName;
    }

    prepareFileDownload() {
        var settings: any = this.settingsService.settings;
        var map: any = settings.map;

        const datedFileName = this.addDateToFileName(map.fileName);
        const resultingFileName = this.addJsonFileEndingIfNecessary(datedFileName);

        let data = {
            fileName: resultingFileName,
            projectName: map.projectName,
            apiVersion: map.apiVersion,
            nodes: [map.root],
            edges: map.edges,
            attributeTypes: map.attributeTypes,
            blacklist: settings.blacklist,
        };
        this.downloadData(data, resultingFileName);
    }

    downloadData(data, fileName) {
        if (typeof data === "object") {
            data = JSON.stringify(data, undefined, 4);
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

export const ribbonBarComponent = {
    selector: "ribbonBarComponent",
    template: require("./ribbonBar.component.html"),
    controller: RibbonBarController
};

