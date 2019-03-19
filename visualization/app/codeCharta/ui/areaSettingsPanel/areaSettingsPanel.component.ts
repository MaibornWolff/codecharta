import "./areaSettingsPanel.component.scss";
import {IRootScopeService} from "angular";
import {SettingsService} from "../../state/settings.service";
import {CodeMapNode, Settings} from "../../codeCharta.model";
import {hierarchy, HierarchyNode} from "d3-hierarchy";
import {CodeMapRenderService} from "../codeMap/codeMap.render.service";

export class AreaSettingsPanelController {

    private static MAX_MARGIN = 100
    private static MARGIN_FACTOR = 4

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
        private settingsService: SettingsService,
        private codeMapRenderService: CodeMapRenderService
    ) {
        SettingsService.subscribe(this.$rootScope, this)
    }

    public onSettingsChanged(settings: Settings, event: angular.IAngularEvent) {
        this._viewModel.dynamicMargin = settings.appSettings.dynamicMargin

        // TODO: cycle potentiallyUpdateMargin()
        this.potentiallyUpdateMargin()
    }

    public applySettings() {
        this.potentiallyUpdateMargin()
        this.settingsService.updateSettings({
            dynamicSettings: {
                margin: this._viewModel.margin
            },
            appSettings: {
                dynamicMargin: this._viewModel.dynamicMargin
            }
        })
    }

    public applySettingsMargin(){
        this._viewModel.dynamicMargin = false
        this.applySettings()
    }

    private potentiallyUpdateMargin() {
        if (this._viewModel.dynamicMargin) {
            this._viewModel.margin = this.computeMargin()
        }
    }

    private computeMargin(): number {
        const s: Settings = this.settingsService.getSettings()
        const renderFile: CodeMapNode = this.codeMapRenderService.getRenderFile().map
        if (renderFile !== null && this._viewModel.dynamicMargin) {
            let leaves = hierarchy<CodeMapNode>(renderFile).leaves()
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
        } else {
            return this._viewModel.margin
        }
    }

}

export const areaSettingsPanelComponent = {
    selector: "areaSettingsPanelComponent",
    template: require("./areaSettingsPanel.component.html"),
    controller: AreaSettingsPanelController
};