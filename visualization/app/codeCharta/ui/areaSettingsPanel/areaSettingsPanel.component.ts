import "./areaSettingsPanel.component.scss"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settingsService/settings.service"
import { CodeMapNode, FileState, RecursivePartial, Settings } from "../../codeCharta.model"
import { hierarchy, HierarchyNode } from "d3-hierarchy"
import { CodeMapPreRenderService, CodeMapPreRenderServiceSubscriber } from "../codeMap/codeMap.preRender.service"
import { FileStateService, FileStateServiceSubscriber } from "../../state/fileState.service"
import { StoreService } from "../../state/store.service"
import { setDynamicMargin } from "../../state/store/appSettings/dynamicMargin/dynamicMargin.actions"
import { setMargin } from "../../state/store/dynamicSettings/margin/margin.actions"
import _ from "lodash"

export class AreaSettingsPanelController implements CodeMapPreRenderServiceSubscriber, FileStateServiceSubscriber {
	private static MIN_MARGIN = 15
	private static MAX_MARGIN = 100
	private static MARGIN_FACTOR = 4
	private static DEBOUNCE_TIME = 400
	private readonly applyDebouncedMargin: () => void

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
		private storeService: StoreService,
		private codeMapPreRenderService: CodeMapPreRenderService
	) {
		SettingsService.subscribe(this.$rootScope, this)
		CodeMapPreRenderService.subscribe(this.$rootScope, this)
		FileStateService.subscribe(this.$rootScope, this)

		this.applyDebouncedMargin = _.debounce(() => {
			this.storeService.dispatch(setMargin(this._viewModel.margin))
		}, AreaSettingsPanelController.DEBOUNCE_TIME)
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>) {
		this._viewModel.dynamicMargin = settings.appSettings.dynamicMargin
		this._viewModel.margin = settings.dynamicSettings.margin
		this.potentiallyUpdateMargin(this.codeMapPreRenderService.getRenderMap(), settings)
	}

	public onRenderMapChanged(map: CodeMapNode) {
		this._viewModel.dynamicMargin = this.settingsService.getSettings().appSettings.dynamicMargin
		this.potentiallyUpdateMargin(map, this.settingsService.getSettings())
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
		this.storeService.dispatch(setDynamicMargin(this._viewModel.dynamicMargin))
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
		this.applyDebouncedMargin()
		this.storeService.dispatch(setDynamicMargin(this._viewModel.dynamicMargin))
	}

	private potentiallyUpdateMargin(map: CodeMapNode, settings: Settings) {
		if (settings.appSettings.dynamicMargin && settings.dynamicSettings.areaMetric && map) {
			const newMargin = this.computeMargin(settings.dynamicSettings.areaMetric, map)
			if (this._viewModel.margin !== newMargin) {
				this._viewModel.margin = newMargin
				this.applySettings()
			}
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
