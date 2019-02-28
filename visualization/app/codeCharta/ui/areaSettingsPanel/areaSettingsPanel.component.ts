import "./areaSettingsPanel.component.scss";
import {IRootScopeService} from "angular";
import {SettingsService} from "../../core/settings/settings.service";
import {CodeMapNode, Settings} from "../../codeCharta.model";
import {hierarchy, HierarchyNode} from "d3-hierarchy";
import {CodeChartaService} from "../../codeCharta.service";

export class AreaSettingsPanelController {

    private static MAX_MARGIN = 100
    private static MARGIN_FACTOR = 4
    private _viewModel = {
        margin: null,
        dynamicMargin: null
    }

    /* @ngInject */
    constructor(
        private $rootScope: IRootScopeService,
        private settingsService: SettingsService,
        private codeChartaService: CodeChartaService
    ) {
        SettingsService.subscribe(this.$rootScope, this)
    }

    public onSettingsChanged(settings: Settings, event: angular.IAngularEvent) {
        this._viewModel.margin = settings.dynamicSettings.margin
        this._viewModel.dynamicMargin = settings.appSettings.dynamicMargin
    }

    public applySettings() {
        if (this._viewModel.dynamicMargin) {
            this._viewModel.margin = this.computeMargin()
        }

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

    private computeMargin(): number {
        const s: Settings = this.settingsService.getSettings()
        const renderMap: CodeMapNode = this.codeChartaService.getRenderMap()
        if (renderMap !== null && this._viewModel.dynamicMargin) {
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