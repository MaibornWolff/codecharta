import "./areaSettingsPanel.component.scss";
import {IRootScopeService, ITimeoutService} from "angular";
import {SettingsService, SettingsServiceSubscriber} from "../../state/settings.service";
import {CCFile, CodeMapNode, FileState, Settings} from "../../codeCharta.model";
import {hierarchy, HierarchyNode} from "d3-hierarchy";
import {CodeMapRenderService, CodeMapRenderServiceSubscriber} from "../codeMap/codeMap.render.service";
import {ThreeOrbitControlsService} from "../codeMap/threeViewer/threeOrbitControlsService";
import {FileStateService, FileStateServiceSubscriber} from "../../state/fileState.service";

export class AreaSettingsPanelController implements SettingsServiceSubscriber, CodeMapRenderServiceSubscriber, FileStateServiceSubscriber {

    private static MAX_MARGIN = 100
    private static MARGIN_FACTOR = 4
    private makeAutoFit: boolean = false

    private _viewModel: {
        margin: number,
        dynamicMargin: boolean
    } = {
        margin: null,
        dynamicMargin: null
    }

    /* @ngInject */
    constructor(
        private $rootScope: IRootScopeService,
        private $timeout: ITimeoutService,
        private settingsService: SettingsService,
        private codeMapRenderService: CodeMapRenderService,
        private threeOrbitControlsService: ThreeOrbitControlsService
    ) {
        SettingsService.subscribe(this.$rootScope, this)
        CodeMapRenderService.subscribe(this.$rootScope, this)
        FileStateService.subscribe(this.$rootScope, this)

    }

    public onSettingsChanged(settings: Settings, event: angular.IAngularEvent) {
        this._viewModel.dynamicMargin = settings.appSettings.dynamicMargin
        if (this._viewModel.dynamicMargin && this.codeMapRenderService.getRenderFile()) {
            const newMargin = this.computeMargin()
            if (newMargin !== this._viewModel.margin) {
                this._viewModel.margin = newMargin
                this.applySettings()
            }
        } else {
            this._viewModel.margin = settings.dynamicSettings.margin
        }
    }

    public onRenderFileChanged(renderFile: CCFile, event: angular.IAngularEvent) {
        if (this._viewModel.dynamicMargin && this.makeAutoFit) {
            const newMargin = this.computeMargin()
            if (newMargin !== this._viewModel.margin) {
                this._viewModel.margin = newMargin
                this.applySettings()
                this.autoFit()
                this.makeAutoFit = false
            }
        }
    }

    public onFileSelectionStatesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
        this.makeAutoFit = true
    }

    public onImportedFilesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
    }

    public onChangeMarginSlider(){
        this._viewModel.dynamicMargin = false
        this.applySettings()
    }

    public onClickDynamicMargin() {
        if (this._viewModel.dynamicMargin) {
            this._viewModel.margin = this.computeMargin()
        }
        this.applySettings()
    }

    public applySettings() {
        this.settingsService.updateSettings({
            dynamicSettings: {
                margin: this._viewModel.margin
            },
            appSettings: {
                dynamicMargin: this._viewModel.dynamicMargin
            }
        })
    }

    private computeMargin(): number {
        const s: Settings = this.settingsService.getSettings()
        const renderMap: CodeMapNode = this.codeMapRenderService.getRenderFile().map
        let leaves = hierarchy<CodeMapNode>(renderMap).leaves()
        let numberOfBuildings = 0
        let totalArea = 0

        leaves.forEach((node: HierarchyNode<CodeMapNode>) => {
            numberOfBuildings++
            if(node.data.attributes && node.data.attributes[s.dynamicSettings.areaMetric]){
                totalArea += node.data.attributes[s.dynamicSettings.areaMetric]
            }
        });

        let margin: number = AreaSettingsPanelController.MARGIN_FACTOR * Math.round(Math.sqrt((totalArea / numberOfBuildings)))
        return Math.min(AreaSettingsPanelController.MAX_MARGIN, Math.max(SettingsService.MIN_MARGIN, margin))
    }

    private autoFit() {
        this.$timeout(() => {
            this.threeOrbitControlsService.autoFitTo()
        }, 500)
    }

}

export const areaSettingsPanelComponent = {
    selector: "areaSettingsPanelComponent",
    template: require("./areaSettingsPanel.component.html"),
    controller: AreaSettingsPanelController
};