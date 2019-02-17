import "./ribbonBar.component.scss";
import $ from "jquery";
import {KindOfMap, SettingsService} from "../../core/settings/settings.service";
import { DownloadService } from "../../core/download/download.service";

export class RibbonBarController {

    private collapsingElements = $("code-map-component #codeMap, ribbon-bar-component #header, ribbon-bar-component .section-body, #toggle-ribbon-bar-fab");
    private toggleElements = $("ribbon-bar-component .section-title");
    private isExpanded: boolean = false;
    private _deltaMode = KindOfMap.Delta;

    /* @ngInject */
    constructor(
        private settingsService: SettingsService,
        private downloadService: DownloadService
    ) {
    }

    public downloadFile() {
        this.downloadService.downloadCurrentMap();
    }

    public changeMargin(){
        this.settingsService.settings.dynamicMargin = false;
        this.settingsService.applySettings();
    }

    public toggle() {
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

    public hoverToggle() {
        this.toggleElements.addClass("toggle-hovered")
    }

    public unhoverToggle() {
        this.toggleElements.removeClass("toggle-hovered")
    }

}

export const ribbonBarComponent = {
    selector: "ribbonBarComponent",
    template: require("./ribbonBar.component.html"),
    controller: RibbonBarController
};

