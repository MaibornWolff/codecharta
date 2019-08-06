import "./areaSettingsPanel.component.scss"
import { IRootScopeService } from "angular"
import { DynamicMarginSubscriber, MarginSubscriber, SettingsService } from "../../state/settings.service"
import { CodeMapNode, FileState } from "../../codeCharta.model"
import { hierarchy, HierarchyNode } from "d3-hierarchy"
import { CodeMapPreRenderService, CodeMapPreRenderServiceSubscriber } from "../codeMap/codeMap.preRender.service"
import { FileStateService, FileStateServiceSubscriber } from "../../state/fileState.service"

export class AreaSettingsPanelController
	implements CodeMapPreRenderServiceSubscriber, FileStateServiceSubscriber, MarginSubscriber, DynamicMarginSubscriber {
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
		SettingsService.subscribeToMargin(this.$rootScope, this)
		SettingsService.subscribeToDynamicMargin(this.$rootScope, this)
		CodeMapPreRenderService.subscribe(this.$rootScope, this)
		FileStateService.subscribe(this.$rootScope, this)
	}

	public onMarginChanged(margin: number) {
		if (this._viewModel.margin !== margin) {
			this._viewModel.margin = margin
			this.applyMargin()
		}
	}

	public onDynamicMarginChanged(dynamicMargin: boolean) {
		this._viewModel.dynamicMargin = dynamicMargin
		this.potentiallyUpdateMargin(
			this.codeMapPreRenderService.getRenderMap(),
			this.settingsService.getSettings().dynamicSettings.areaMetric
		)
	}

	public onRenderMapChanged(map: CodeMapNode) {
		this._viewModel.dynamicMargin = this.settingsService.getSettings().appSettings.dynamicMargin
		this.potentiallyUpdateMargin(map, this.settingsService.getSettings().dynamicSettings.areaMetric)
	}

	public onFileSelectionStatesChanged(fileStates: FileState[]) {
		this.resetDynamicMargin()
	}

	public onImportedFilesChanged(fileStates: FileState[]) {}

	private resetDynamicMargin() {
		this._viewModel.dynamicMargin = true
		this.applySettingsDynamicMargin()
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

	public applyMargin() {
		this.settingsService.updateSettings({
			dynamicSettings: {
				margin: this._viewModel.margin
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

	private potentiallyUpdateMargin(map: CodeMapNode, areaMetric: string) {
		if (this._viewModel.dynamicMargin && areaMetric && map) {
			const newMargin = this.computeMargin(areaMetric, map)
			this.onMarginChanged(newMargin)
		}
	}

	private computeMargin(areaMetric: string, map: CodeMapNode): number {
		let leaves = hierarchy<CodeMapNode>(map).leaves()
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
