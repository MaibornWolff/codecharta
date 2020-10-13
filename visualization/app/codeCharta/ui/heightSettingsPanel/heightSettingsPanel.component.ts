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
import {
	ShowMetricLabelNameValueService,
	ShowMetricLabelNameValueSubscriber
} from "../../state/store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.service";
import {setShowMetricLabelNameValue} from "../../state/store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.actions";
import {
	ShowMetricLabelNodeNameService,
	ShowMetricLabelNodeNameSubscriber
} from "../../state/store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.service";
import {setShowMetricLabelNodeName} from "../../state/store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.actions";

export class HeightSettingsPanelController
	implements FilesSelectionSubscriber, AmountOfTopLabelsSubscriber, ScalingSubscriber, InvertHeightSubscriber, ShowMetricLabelNameValueSubscriber, ShowMetricLabelNodeNameSubscriber {
	private static DEBOUNCE_TIME = 400
	private readonly applyDebouncedTopLabels: () => void
	private readonly applyDebouncedScaling: (newScaling: Vector3) => void

	private _viewModel: {
		amountOfTopLabels: number
		scalingY: number
		invertHeight: boolean
		isDeltaState: boolean
		showMetricValue: boolean
		showNodeName: boolean
	} = {
		amountOfTopLabels: null,
		scalingY: null,
		invertHeight: null,
		isDeltaState: null,
		showMetricValue: true,
		showNodeName: true
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		AmountOfTopLabelsService.subscribe(this.$rootScope, this)
		ScalingService.subscribe(this.$rootScope, this)
		InvertHeightService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
		ShowMetricLabelNameValueService.subscribe(this.$rootScope, this)
		ShowMetricLabelNodeNameService.subscribe(this.$rootScope, this)

		this.applyDebouncedTopLabels = _.debounce(() => {
			this.storeService.dispatch(setAmountOfTopLabels(this._viewModel.amountOfTopLabels))
		}, HeightSettingsPanelController.DEBOUNCE_TIME)

		this.applyDebouncedScaling = _.debounce(newScaling => {
			this.storeService.dispatch(setScaling(newScaling))
		}, HeightSettingsPanelController.DEBOUNCE_TIME)
	}

	onAmountOfTopLabelsChanged(amountOfTopLabels: number) {
		this._viewModel.amountOfTopLabels = amountOfTopLabels
	}

	onInvertHeightChanged(invertHeight: boolean) {
		this._viewModel.invertHeight = invertHeight
	}

	onShowMetricLabelNameValueChanged(showMetricValue: boolean){
		this._viewModel.showMetricValue = showMetricValue
	}

	onShowMetricLabelNodeNameChanged(showMetricLabelNodeName: boolean) {
		this._viewModel.showNodeName = showMetricLabelNodeName
	}

	onScalingChanged(scaling) {
		this._viewModel.scalingY = scaling.y
	}

	onFilesSelectionChanged(files: FileState[]) {
		this._viewModel.isDeltaState = isDeltaState(files)
	}

	applySettingsAmountOfTopLabels() {
		this.applyDebouncedTopLabels()
	}

	applySettingsMetricLabelValueChanged(){
		this.storeService.dispatch(setShowMetricLabelNameValue(this._viewModel.showMetricValue))
	}

	applySettingsMetricLabelNodeNameChanged(){
		this.storeService.dispatch(setShowMetricLabelNodeName(this._viewModel.showNodeName))
	}

	applySettingsInvertHeight() {
		this.storeService.dispatch(setInvertHeight(this._viewModel.invertHeight))
	}

	applySettingsScaling() {
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
