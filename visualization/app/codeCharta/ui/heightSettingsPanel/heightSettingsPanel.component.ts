import "./heightSettingsPanel.component.scss"
import { IRootScopeService } from "angular"
import { Vector3 } from "three"
import { SettingsService } from "../../state/settingsService/settings.service"
import { FileState } from "../../codeCharta.model"
import { FileStateService, FileStateServiceSubscriber } from "../../state/fileState.service"
import { FileStateHelper } from "../../util/fileStateHelper"
import { StoreService } from "../../state/store.service"
import { setAmountOfTopLabels } from "../../state/store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { setInvertHeight } from "../../state/store/appSettings/invertHeight/invertHeight.actions"
import { setScaling } from "../../state/store/appSettings/scaling/scaling.actions"
import _ from "lodash"
import {
	AmountOfTopLabelsService,
	AmountOfTopLabelsSubscriber
} from "../../state/store/appSettings/amountOfTopLabels/amountOfTopLabels.service"
import { ScalingService, ScalingSubscriber } from "../../state/store/appSettings/scaling/scaling.service"
import { InvertHeightService, InvertHeightSubscriber } from "../../state/store/appSettings/invertHeight/invertHeight.service"

export class HeightSettingsPanelController
	implements FileStateServiceSubscriber, AmountOfTopLabelsSubscriber, ScalingSubscriber, InvertHeightSubscriber {
	private static DEBOUNCE_TIME = 400
	private readonly applyDebouncedTopLabels: () => void
	private readonly applyDebouncedScaling: (newScaling: Vector3) => void

	private _viewModel: {
		amountOfTopLabels: number
		scalingY: number
		invertHeight: boolean
		isDeltaState: boolean
	} = {
		amountOfTopLabels: null,
		scalingY: null,
		invertHeight: null,
		isDeltaState: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private settingsService: SettingsService, private storeService: StoreService) {
		AmountOfTopLabelsService.subscribe(this.$rootScope, this)
		ScalingService.subscribe(this.$rootScope, this)
		InvertHeightService.subscribe(this.$rootScope, this)
		FileStateService.subscribe(this.$rootScope, this)

		this.applyDebouncedTopLabels = _.debounce(() => {
			this.storeService.dispatch(setAmountOfTopLabels(this._viewModel.amountOfTopLabels))
		}, HeightSettingsPanelController.DEBOUNCE_TIME)

		this.applyDebouncedScaling = _.debounce(newScaling => {
			this.storeService.dispatch(setScaling(newScaling))
		}, HeightSettingsPanelController.DEBOUNCE_TIME)
	}

	public onAmountOfTopLabelsChanged(amountOfTopLabels: number) {
		this._viewModel.amountOfTopLabels = amountOfTopLabels
	}

	public onInvertHeightChanged(invertHeight: boolean) {
		this._viewModel.invertHeight = invertHeight
	}

	public onScalingChanged(scaling) {
		this._viewModel.scalingY = scaling.y
	}

	public onFileSelectionStatesChanged(fileStates: FileState[]) {
		this._viewModel.isDeltaState = FileStateHelper.isDeltaState(fileStates)
	}

	public onImportedFilesChanged(fileStates: FileState[]) {}

	public applySettingsAmountOfTopLabels() {
		this.settingsService.updateSettings({
			appSettings: {
				amountOfTopLabels: this._viewModel.amountOfTopLabels
			}
		})
		this.applyDebouncedTopLabels()
	}

	public applySettingsInvertHeight() {
		this.settingsService.updateSettings({
			appSettings: {
				invertHeight: this._viewModel.invertHeight
			}
		})
		this.storeService.dispatch(setInvertHeight(this._viewModel.invertHeight))
	}

	public applySettingsScaling() {
		const oldScaling = this.settingsService.getSettings().appSettings.scaling
		const newScaling = new Vector3(oldScaling.x, this._viewModel.scalingY, oldScaling.z)
		this.settingsService.updateSettings({
			appSettings: {
				scaling: newScaling
			}
		})
		this.applyDebouncedScaling(newScaling)
	}
}

export const heightSettingsPanelComponent = {
	selector: "heightSettingsPanelComponent",
	template: require("./heightSettingsPanel.component.html"),
	controller: HeightSettingsPanelController
}
