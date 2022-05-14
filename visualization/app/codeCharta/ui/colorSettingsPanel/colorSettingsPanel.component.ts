import "./colorSettingsPanel.component.scss"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"
import { FilesService, FilesSelectionSubscriber } from "../../state/store/files/files.service"
import { isDeltaState } from "../../model/files/files.helper"
import { FileState } from "../../model/files/files"
import { setColorLabels } from "../../state/store/appSettings/colorLabels/colorLabels.actions"
import { ColorMode } from "../../codeCharta.model"
import { ColorModeService, ColorModeSubscriber } from "../../state/store/dynamicSettings/colorMode/colorMode.service"
import { defaultColorMode, setColorMode } from "../../state/store/dynamicSettings/colorMode/colorMode.actions"

export class ColorSettingsPanelController implements FilesSelectionSubscriber, ColorModeSubscriber {
	private _viewModel: {
		invertColorRange: boolean
		invertDeltaColors: boolean
		isDeltaState: boolean
		colorMode: ColorMode
		colorLabels: { positive: boolean; negative: boolean; neutral: boolean }
	} = {
		invertColorRange: null,
		invertDeltaColors: null,
		isDeltaState: null,
		colorMode: defaultColorMode,
		colorLabels: { positive: false, negative: false, neutral: false }
	}

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		FilesService.subscribe(this.$rootScope, this)
		ColorModeService.subscribe(this.$rootScope, this)
	}

	onColorModeChanged(colorMode: ColorMode) {
		this._viewModel.colorMode = colorMode
	}

	onFilesSelectionChanged(files: FileState[]) {
		this._viewModel.isDeltaState = isDeltaState(files)
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
