"use strict";
import "./sidenav.component.scss";
import { DialogService } from "../dialog/dialog.service";
import {SettingsService} from "../../core/settings/settings.service";
import any = jasmine.any;

export class SidenavController {

    /* @ngInject */
    constructor(
        private dialogService: DialogService,
        private settingsService: SettingsService,
        private $mdSidenav: any
    ) {
    }

    showUrlParams() {
        this.dialogService.showQueryParamDialog();
    }

    toggleSidenav(navID) {
        this.$mdSidenav(navID).toggle();
    }

    downloadCurrentJson() {
        const filename: string = this.settingsService.settings.map.fileName;
        var map: any = this.settingsService.settings.map;
        var blacklist = this.settingsService.settings.blacklist;
        var userSettings = this.settingsService.settings;
        delete userSettings.map;
        delete userSettings.blacklist;

        let data = {
            fileName: map.fileName,
            projectName: map.projectName,
            apiVersion: map.apiVersion,
            nodes: [map.root],
            edges: map.edges,
            attributeTypes: map.attributeTypes,
            userSettings: userSettings,
            blacklist: blacklist,
        };
        this.downloadData(data, filename);
    }

    downloadData(data, filename) {
        if (typeof data === "object") {
            data = JSON.stringify(data, undefined, 4);
        }

        const blob = new Blob([data], {type: "text/json"});
        const e = document.createEvent("MouseEvents");
        const a = document.createElement("a");

        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
        e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
    }
}

export const sidenavComponent = {
    selector: "sidenavComponent",
    template: require("./sidenav.component.html"),
    controller: SidenavController
};

export const sidenavToggleComponent = {
    selector: "sidenavToggleComponent",
    template: require("./sidenav.toggle.component.html"),
    controller: SidenavController
};



