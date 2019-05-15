import "./areaSettingsPanel.component.scss"
import { IRootScopeService } from "angular"
import { SettingsService, SettingsServiceSubscriber } from "../../state/settings.service"
import { CCFile, CodeMapNode, RecursivePartial, Settings } from "../../codeCharta.model"
import { hierarchy, HierarchyNode } from "d3-hierarchy"
import { CodeMapPreRenderService, CodeMapPreRenderServiceSubscriber } from "../codeMap/codeMap.preRender.service"

export class AreaSettingsPanelController implements SettingsServiceSubscriber, CodeMapPreRenderServiceSubscriber {
	private static MIN_MARGIN = 15
	private static MAX_MARGIN = 100
	private static MARGIN_FACTOR = 4

	private _viewModel: {
		margin: number
		dynamicMargin: boolean
	} = {
		margin: null,
		dynamicMargin: null
	}

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private settingsService: SettingsService,
		private codeMapPreRenderService: CodeMapPreRenderService
	) {
		SettingsService.subscribe(this.$rootScope, this)
		CodeMapPreRenderService.subscribe(this.$rootScope, this)
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>, event: angular.IAngularEvent) {
		this._viewModel.dynamicMargin = settings.appSettings.dynamicMargin
		this._viewModel.margin = settings.dynamicSettings.margin
		this.potentiallyUpdateMargin(this.codeMapPreRenderService.getRenderFile(), settings)
	}

	public onRenderFileChanged(renderFile: CCFile, event: angular.IAngularEvent) {
		this._viewModel.dynamicMargin = this.settingsService.getSettings().appSettings.dynamicMargin
		this.potentiallyUpdateMargin(renderFile, this.settingsService.getSettings())
	}

	public onChangeMarginSlider() {
		this._viewModel.dynamicMargin = false
		this.applySettings()
	}

	public applySettingsDynamicMargin() {
		this.settingsService.updateSettings({
			appSettings: {
				dynamicMargin: this._viewModel.dynamicMargin
			}
		})
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
		if (settings.appSettings.dynamicMargin && settings.dynamicSettings.areaMetric && renderFile) {
			const newMargin = this.computeMargin(settings.dynamicSettings.areaMetric, renderFile)
			if (this._viewModel.margin !== newMargin) {
				this._viewModel.margin = newMargin
				this.applySettings()
			}
		}
	}

	private computeMargin(areaMetric: string, renderFile: CCFile): number {
		let leaves = hierarchy<CodeMapNode>(renderFile.map).leaves()
		let numberOfBuildings = 0
		let totalArea = 0

		leaves.forEach((node: HierarchyNode<CodeMapNode>) => {
			numberOfBuildings++
			if (node.data.attributes && node.data.attributes[areaMetric]) {
				totalArea += node.data.attributes[areaMetric]
			}
		})

		let margin: number = AreaSettingsPanelController.MARGIN_FACTOR * Math.round(Math.sqrt(totalArea / numberOfBuildings))
		return Math.min(AreaSettingsPanelController.MAX_MARGIN, Math.max(AreaSettingsPanelController.MIN_MARGIN, margin))
	}
}

export const areaSettingsPanelComponent = {
	selector: "areaSettingsPanelComponent",
	template: require("./areaSettingsPanel.component.html"),
	controller: AreaSettingsPanelController
}
