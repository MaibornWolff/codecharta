import "./ribbonBar.component.scss";
import $ from "jquery";
import {SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import { DownloadService } from "../../core/download/download.service";
import {IRootScopeService} from "angular";
import {Settings} from "../../codeCharta.model";

export class RibbonBarController implements SettingsServiceSubscriber {

    private collapsingElements = $("code-map-component #codeMap, ribbon-bar-component #header, ribbon-bar-component .section-body, #toggle-ribbon-bar-fab")
    private toggleElements = $("ribbon-bar-component .section-title")
    private isExpanded: boolean = false;
    private _viewModel = {
        renderMode: null
    }

    /* @ngInject */
    constructor(
        private $rootScope: IRootScopeService,
        private settingsService: SettingsService,
        private downloadService: DownloadService
    ) {
        SettingsService.subscribe(this.$rootScope, this)
    }

    public onSettingsChanged(settings: Settings, event: angular.IAngularEvent) {
        this._viewModel.renderMode = settings.dynamicSettings.renderMode
    }

    public downloadFile() {
        this.downloadService.downloadCurrentMap()
    }

    public toggle() {
        if (!this.isExpanded) {
            this.expand()
        } else {
            this.collapse()
        }
    }

    public expand() {
        this.isExpanded = true;
        this.collapsingElements.addClass("expanded")
    }

    public collapse() {
        this.isExpanded = false
        this.collapsingElements.removeClass("expanded")
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

