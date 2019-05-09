import "./ribbonBar.component.scss";
import $ from "jquery";
import {IRootScopeService, ITimeoutService} from "angular";
import {FileState} from "../../codeCharta.model";
import {FileStateService, FileStateServiceSubscriber} from "../../state/fileState.service";
import {FileStateHelper} from "../../util/fileStateHelper";
import {FileDownloader} from "../../util/fileDownloader";
import {CodeMapPreRenderService} from "../codeMap/codeMap.preRender.service";
import { DialogService } from "../dialog/dialog.service";

export interface RibbonBarControllerSubscriber {
    onLoadingMapStatusChanged(isLoadingMap: boolean, event: angular.IAngularEvent)
}

export class RibbonBarController implements FileStateServiceSubscriber, RibbonBarControllerSubscriber {

    public static readonly LOADING_MAP_STATUS_EVENT = "loading-map-status-changed"

    private collapsingElements = $("code-map-component #codeMap, ribbon-bar-component #header, ribbon-bar-component .section-body, #toggle-ribbon-bar-fab")
    private toggleElements = $("ribbon-bar-component .section-title")
    private isExpanded: boolean = false;

    private _viewModel: {
        isDeltaState: boolean,
        isLoadingMap: boolean
    } = {
        isDeltaState: null,
        isLoadingMap: true
    }

    /* @ngInject */
    constructor(
        private $rootScope: IRootScopeService,
        private $timeout: ITimeoutService,
        private codeMapPreRenderService: CodeMapPreRenderService,
        private dialogService: DialogService
    ) {
        FileStateService.subscribe(this.$rootScope, this)
        RibbonBarController.subscribe(this.$rootScope, this)
    }

    public onFileSelectionStatesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
        this._viewModel.isDeltaState = FileStateHelper.isDeltaState(fileStates)
    }

    public onImportedFilesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
    }

    public onLoadingMapStatusChanged(isLoadingMap: boolean, event: angular.IAngularEvent) {
        this._viewModel.isLoadingMap = isLoadingMap
        this.synchronizeAngularTwoWayBinding()
    }

    public downloadFile() {
        this.dialogService.showDownloadDialog()
        //FileDownloader.downloadCurrentMap(this.codeMapPreRenderService.getRenderFile())
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

    private synchronizeAngularTwoWayBinding() {
        this.$timeout(() => {})
    }

    public static subscribe($rootScope: IRootScopeService, subscriber: RibbonBarControllerSubscriber) {
        $rootScope.$on(RibbonBarController.LOADING_MAP_STATUS_EVENT, (event, data) => {
            subscriber.onLoadingMapStatusChanged(data, event)
        })
    }
}

export const ribbonBarComponent = {
    selector: "ribbonBarComponent",
    template: require("./ribbonBar.component.html"),
    controller: RibbonBarController
};

