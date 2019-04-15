import "./areaSettingsPanel.component.scss";
import {IRootScopeService, ITimeoutService} from "angular";
import {SettingsService, SettingsServiceSubscriber} from "../../state/settings.service";
import {CCFile, CodeMapNode, FileState, Settings} from "../../codeCharta.model";
import {hierarchy, HierarchyNode} from "d3-hierarchy";
import {CodeMapRenderService, CodeMapRenderServiceSubscriber} from "../codeMap/codeMap.render.service";
import {ThreeOrbitControlsService} from "../codeMap/threeViewer/threeOrbitControlsService";
import {FileStateService, FileStateServiceSubscriber} from "../../state/fileState.service";

export class AreaSettingsPanelController implements SettingsServiceSubscriber, CodeMapRenderServiceSubscriber, FileStateServiceSubscriber {

    private static MIN_MARGIN = 15
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
        this.potentiallyUpdateMargin(this.codeMapRenderService.getRenderFile(), settings)
    }

    public onRenderFileChanged(renderFile: CCFile, event: angular.IAngularEvent) {
        this._viewModel.dynamicMargin = this.settingsService.getSettings().appSettings.dynamicMargin
        this.potentiallyUpdateMargin(renderFile, this.settingsService.getSettings())
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
        this.potentiallyUpdateMargin(this.codeMapRenderService.getRenderFile(), this.settingsService.getSettings())
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

    private potentiallyUpdateMargin(renderFile: CCFile, settings: Settings) {
        if (settings.appSettings.dynamicMargin
            && settings.dynamicSettings.areaMetric
            && renderFile) {

            const newMargin = this.computeMargin(settings.dynamicSettings.areaMetric, renderFile)
            if (this._viewModel.margin !== newMargin) {
                this._viewModel.margin = newMargin
                this.applySettings()

                if (this.makeAutoFit) {
                    this.autoFit()
                    this.makeAutoFit = false
                }
            }
        } else {
            this._viewModel.margin = settings.dynamicSettings.margin
        }
    }

    private computeMargin(areaMetric: string, renderFile: CCFile): number {
        let leaves = hierarchy<CodeMapNode>(renderFile.map).leaves()
        let numberOfBuildings = 0
        let totalArea = 0

        leaves.forEach((node: HierarchyNode<CodeMapNode>) => {
            numberOfBuildings++
            if(node.data.attributes && node.data.attributes[areaMetric]){
                totalArea += node.data.attributes[areaMetric]
            }
        });

        let margin: number = AreaSettingsPanelController.MARGIN_FACTOR * Math.round(Math.sqrt((totalArea / numberOfBuildings)))
        return Math.min(AreaSettingsPanelController.MAX_MARGIN, Math.max(AreaSettingsPanelController.MIN_MARGIN, margin))
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