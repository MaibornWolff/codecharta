import "./areaSettingsPanel.component.scss"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settingsService/settings.service"
import { CodeMapNode, FileState } from "../../codeCharta.model"
import { hierarchy, HierarchyNode } from "d3-hierarchy"
import { CodeMapPreRenderService, CodeMapPreRenderServiceSubscriber } from "../codeMap/codeMap.preRender.service"
import { FileStateService, FileStateServiceSubscriber } from "../../state/fileState.service"
import { StoreService } from "../../state/store.service"
import { setDynamicMargin } from "../../state/store/appSettings/dynamicMargin/dynamicMargin.actions"
import { setMargin } from "../../state/store/dynamicSettings/margin/margin.actions"
import _ from "lodash"
import { DynamicMarginService, DynamicMarginSubscriber } from "../../state/store/appSettings/dynamicMargin/dynamicMargin.service"
import { MarginService, MarginSubscriber } from "../../state/store/dynamicSettings/margin/margin.service"

export class AreaSettingsPanelController
	implements CodeMapPreRenderServiceSubscriber, FileStateServiceSubscriber, DynamicMarginSubscriber, MarginSubscriber {
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
		DynamicMarginService.subscribe(this.$rootScope, this)
		MarginService.subscribe(this.$rootScope, this)
		CodeMapPreRenderService.subscribe(this.$rootScope, this)
		FileStateService.subscribe(this.$rootScope, this)

		this.applyDebouncedMargin = _.debounce(() => {
			this.storeService.dispatch(setMargin(this._viewModel.margin))
		}, AreaSettingsPanelController.DEBOUNCE_TIME)
	}

	public onDynamicMarginChanged(dynamicMargin: boolean) {
		this._viewModel.dynamicMargin = dynamicMargin
		this.potentiallyUpdateMargin()
	}

	public onMarginChanged(margin: number) {
		this._viewModel.margin = margin
	}

	public onRenderMapChanged(map: CodeMapNode) {
		this.potentiallyUpdateMargin(map)
	}

	public onFileSelectionStatesChanged(fileStates: FileState[]) {
		this._viewModel.dynamicMargin = true
		this.applyDynamicMargin()
	}

	public onImportedFilesChanged(fileStates: FileState[]) {}

	private applyDynamicMargin() {
		this.settingsService.updateSettings({
			appSettings: {
				dynamicMargin: this._viewModel.dynamicMargin
			}
		})
		this.storeService.dispatch(setDynamicMargin(this._viewModel.dynamicMargin))
	}

	public onChangeMarginSlider() {
		this.settingsService.updateSettings({
			dynamicSettings: {
				margin: this._viewModel.margin
			},
			appSettings: {
				dynamicMargin: false
			}
		})
		this.applyDebouncedMargin()
		this.storeService.dispatch(setDynamicMargin(false))
	}

	private potentiallyUpdateMargin(map: CodeMapNode = this.codeMapPreRenderService.getRenderMap()) {
		if (this._viewModel.dynamicMargin && this.storeService.getState().dynamicSettings.areaMetric && map) {
			const newMargin = this.computeMargin(this.storeService.getState().dynamicSettings.areaMetric, map)
			if (this._viewModel.margin !== newMargin) {
				this.settingsService.updateSettings({
					dynamicSettings: {
						margin: newMargin
					}
				})
				this.storeService.dispatch(setMargin(newMargin))
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
