import "./ribbonBar.component.scss";
import $ from "jquery";
import {SettingsService} from "../../state/settings.service";
import {IRootScopeService} from "angular";
import {FileSelectionState, FileState, MetricData} from "../../codeCharta.model";
import {FileStateService, FileStateServiceSubscriber} from "../../state/fileState.service";
import {DownloadService} from "../../util/download.service";

export class RibbonBarController implements FileStateServiceSubscriber {

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
        private fileStateService: FileStateService
    ) {
        FileStateService.subscribe(this.$rootScope, this)
    }

    onFileSelectionStatesChanged(fileStates: FileState[], metricData: MetricData[], renderState: FileSelectionState, event: angular.IAngularEvent) {
        this._viewModel.renderMode = FileStateService.getRenderState(fileStates)
    }

    onImportedFilesChanged(fileStates: FileState[], metricData: MetricData[], renderState: FileSelectionState, event: angular.IAngularEvent) {

    }

    public downloadFile() {
        // TODO: get renderedFile
        //DownloadService.downloadCurrentMap(this.settingsService.getSettings(), this.fileStateService.getRenderFile())
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

