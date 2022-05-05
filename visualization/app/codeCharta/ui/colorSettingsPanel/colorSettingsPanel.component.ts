import "./colorSettingsPanel.component.scss"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"
import { FilesService, FilesSelectionSubscriber } from "../../state/store/files/files.service"
import { isDeltaState } from "../../model/files/files.helper"
import { FileState } from "../../model/files/files"
import { ColorRangeService, ColorRangeSubscriber } from "../../state/store/dynamicSettings/colorRange/colorRange.service"
import { setColorLabels } from "../../state/store/appSettings/colorLabels/colorLabels.actions"
import { ColorMode, ColorRange } from "../../codeCharta.model"
import { BlacklistService } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { NodeMetricDataService } from "../../state/store/metricData/nodeMetricData/nodeMetricData.service"
import { ColorMetricService } from "../../state/store/dynamicSettings/colorMetric/colorMetric.service"
import { ColorModeService, ColorModeSubscriber } from "../../state/store/dynamicSettings/colorMode/colorMode.service"
import { defaultColorMode, setColorMode } from "../../state/store/dynamicSettings/colorMode/colorMode.actions"
import { HandleValueChange } from "./rangeSlider/rangeSlider.component"

export class ColorSettingsPanelController implements FilesSelectionSubscriber, ColorRangeSubscriber, ColorModeSubscriber {
	private _viewModel: {
		invertColorRange: boolean
		invertDeltaColors: boolean
		isDeltaState: boolean
		colorRange: { from: number; to: number }
		colorMode: ColorMode
		colorLabels: { positive: boolean; negative: boolean; neutral: boolean }
		maxMetricValue: number
	} = {
		invertColorRange: null,
		invertDeltaColors: null,
		isDeltaState: null,
		colorRange: { from: null, to: null },
		colorMode: defaultColorMode,
		colorLabels: { positive: false, negative: false, neutral: false },
		maxMetricValue: null
	}

	currentLeftValue = 62
	currentRightValue = 80
	handleValueChange: HandleValueChange = ({ currentLeftValue, currentRightValue }) => {
		this.currentLeftValue = currentLeftValue
		this.currentRightValue = currentRightValue
	}

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private nodeMetricDataService: NodeMetricDataService
	) {
		"ngInject"
		FilesService.subscribe(this.$rootScope, this)
		ColorRangeService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
		ColorMetricService.subscribe(this.$rootScope, this)
		ColorModeService.subscribe(this.$rootScope, this)
	}

	onBlacklistChanged() {
		this.updateMaxMetricValue()
	}

	onColorRangeChanged(colorRange: ColorRange) {
		this._viewModel.colorRange = colorRange
	}

	onColorModeChanged(colorMode: ColorMode) {
		this._viewModel.colorMode = colorMode
	}

	onFilesSelectionChanged(files: FileState[]) {
		this._viewModel.isDeltaState = isDeltaState(files)
		this.updateMaxMetricValue()
	}

	onColorMetricChanged() {
		this.updateMaxMetricValue()
	}

	applyColorMode() {
		this.storeService.dispatch(setColorMode(this._viewModel.colorMode))
	}

	swapColorLabelsPositive() {
		const colorLabels = this.storeService.getState().appSettings.colorLabels
		colorLabels.positive = !colorLabels.positive
		this.storeService.dispatch(setColorLabels(colorLabels))
	}

	swapColorLabelsNegative() {
		const colorLabels = this.storeService.getState().appSettings.colorLabels
		colorLabels.negative = !colorLabels.negative
		this.storeService.dispatch(setColorLabels(colorLabels))
	}

	swapColorLabelsNeutral() {
		const colorLabels = this.storeService.getState().appSettings.colorLabels
		colorLabels.neutral = !colorLabels.neutral
		this.storeService.dispatch(setColorLabels(colorLabels))
	}

	invertColorRange() {
		const mapColors = this.storeService.getState().appSettings.mapColors
		this.storeService.dispatch(
			setMapColors({
				...mapColors,
				positive: mapColors.negative,
				negative: mapColors.positive
			})
		)
	}

	resetInvertColorRangeCheckboxOnly = () => {
		this._viewModel.invertColorRange = null
		this._viewModel.invertDeltaColors = null
	}

	private updateMaxMetricValue() {
		this._viewModel.maxMetricValue = this.nodeMetricDataService.getMaxValueOfMetric(
			this.storeService.getState().dynamicSettings.colorMetric
		)
	}

	invertDeltaColors() {
		const { positiveDelta, negativeDelta } = this.storeService.getState().appSettings.mapColors

		this.storeService.dispatch(
			setMapColors({
				...this.storeService.getState().appSettings.mapColors,
				negativeDelta: positiveDelta,
				positiveDelta: negativeDelta
			})
		)
	}
}

export const colorSettingsPanelComponent = {
	selector: "colorSettingsPanelComponent",
	template: require("./colorSettingsPanel.component.html"),
	controller: ColorSettingsPanelController
}
