import "./colorSettingsPanel.component.scss"
import { FileState } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { FileStateService, FileStateServiceSubscriber } from "../../state/fileState.service"
import { FileStateHelper } from "../../util/fileStateHelper"
import { StoreService } from "../../state/store.service"
import { setInvertColorRange } from "../../state/store/appSettings/invertColorRange/invertColorRange.actions"
import { setInvertDeltaColors } from "../../state/store/appSettings/invertDeltaColors/invertDeltaColors.actions"
import { setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"
import { setWhiteColorBuildings } from "../../state/store/appSettings/whiteColorBuildings/whiteColorBuildings.actions"
import {
	InvertDeltaColorsService,
	InvertDeltaColorsSubscriber
} from "../../state/store/appSettings/invertDeltaColors/invertDeltaColors.service"
import {
	WhiteColorBuildingsService,
	WhiteColorBuildingsSubscriber
} from "../../state/store/appSettings/whiteColorBuildings/whiteColorBuildings.service"
import {
	InvertColorRangeService,
	InvertColorRangeSubscriber
} from "../../state/store/appSettings/invertColorRange/invertColorRange.service"

export class ColorSettingsPanelController
	implements FileStateServiceSubscriber, InvertDeltaColorsSubscriber, WhiteColorBuildingsSubscriber, InvertColorRangeSubscriber {
	private _viewModel: {
		invertColorRange: boolean
		invertDeltaColors: boolean
		whiteColorBuildings: boolean
		isDeltaState: boolean
	} = {
		invertColorRange: null,
		invertDeltaColors: null,
		whiteColorBuildings: null,
		isDeltaState: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		FileStateService.subscribe(this.$rootScope, this)
		InvertDeltaColorsService.subscribe(this.$rootScope, this)
		WhiteColorBuildingsService.subscribe(this.$rootScope, this)
		InvertColorRangeService.subscribe(this.$rootScope, this)
	}

	public onInvertColorRangeChanged(invertColorRange: boolean) {
		this._viewModel.invertColorRange = invertColorRange
	}

	public onInvertDeltaColorsChanged(invertDeltaColors: boolean) {
		this._viewModel.invertDeltaColors = invertDeltaColors
	}

	public onWhiteColorBuildingsChanged(whiteColorBuildings: boolean) {
		this._viewModel.whiteColorBuildings = whiteColorBuildings
	}

	public onFileStatesChanged(fileStates: FileState[]) {
		this._viewModel.isDeltaState = FileStateHelper.isDeltaState(fileStates)
	}

	public invertColorRange() {
		this.storeService.dispatch(setInvertColorRange(this._viewModel.invertColorRange))
	}

	public invertDeltaColors() {
		const positiveDelta = this.storeService.getState().appSettings.mapColors.positiveDelta
		const negativeDelta = this.storeService.getState().appSettings.mapColors.negativeDelta

		this.storeService.dispatch(setInvertDeltaColors(this._viewModel.invertDeltaColors))
		this.storeService.dispatch(
			setMapColors({
				...this.storeService.getState().appSettings.mapColors,
				negativeDelta: positiveDelta,
				positiveDelta: negativeDelta
			})
		)
	}

	public applyWhiteColorBuildings() {
		this.storeService.dispatch(setWhiteColorBuildings(this._viewModel.whiteColorBuildings))
	}
}

export const colorSettingsPanelComponent = {
	selector: "colorSettingsPanelComponent",
	template: require("./colorSettingsPanel.component.html"),
	controller: ColorSettingsPanelController
}
