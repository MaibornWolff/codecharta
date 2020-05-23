import "./heightSettingsPanel.component.scss"
import { IRootScopeService } from "angular"
import { Vector3 } from "three"
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
import { FilesService, FilesSelectionSubscriber } from "../../state/store/files/files.service"
import { isDeltaState } from "../../model/files/files.helper"
import { FileState } from "../../model/files/files"

export class HeightSettingsPanelController
	implements FilesSelectionSubscriber, AmountOfTopLabelsSubscriber, ScalingSubscriber, InvertHeightSubscriber {
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
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		AmountOfTopLabelsService.subscribe(this.$rootScope, this)
		ScalingService.subscribe(this.$rootScope, this)
		InvertHeightService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)

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

	public onFilesSelectionChanged(files: FileState[]) {
		this._viewModel.isDeltaState = isDeltaState(files)
	}

	public applySettingsAmountOfTopLabels() {
		this.applyDebouncedTopLabels()
	}

	public applySettingsInvertHeight() {
		this.storeService.dispatch(setInvertHeight(this._viewModel.invertHeight))
	}

	public applySettingsScaling() {
		const oldScaling = this.storeService.getState().appSettings.scaling
		const newScaling = new Vector3(oldScaling.x, this._viewModel.scalingY, oldScaling.z)

		this.applyDebouncedScaling(newScaling)
	}
}

export const heightSettingsPanelComponent = {
	selector: "heightSettingsPanelComponent",
	template: require("./heightSettingsPanel.component.html"),
	controller: HeightSettingsPanelController
}
