import { IRootScopeService } from "angular"
import { Vector3 } from "three"
import { StoreService } from "../../state/store.service"
import { setInvertHeight } from "../../state/store/appSettings/invertHeight/invertHeight.actions"
import { setScaling } from "../../state/store/appSettings/scaling/scaling.actions"
import debounce from "lodash.debounce"
import { ScalingService, ScalingSubscriber } from "../../state/store/appSettings/scaling/scaling.service"
import { InvertHeightService, InvertHeightSubscriber } from "../../state/store/appSettings/invertHeight/invertHeight.service"
import { FilesService, FilesSelectionSubscriber } from "../../state/store/files/files.service"
import { isDeltaState } from "../../model/files/files.helper"
import { FileState } from "../../model/files/files"
import {
	LabelShowNodeNameService,
	ShowMetricLabelNameValueSubscriber
} from "../../state/store/appSettings/showMetricLabelNameValue/labelShowNodeNameService"
import { setShowMetricLabelNameValue } from "../../state/store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.actions"
import {
	LabelShowMetricValueService,
	ShowMetricLabelNodeNameSubscriber
} from "../../state/store/appSettings/showMetricLabelNodeName/labelShowMetricValueService"
import { setShowMetricLabelNodeName } from "../../state/store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.actions"

export class HeightSettingsPanelController
	implements
		FilesSelectionSubscriber,
		ScalingSubscriber,
		InvertHeightSubscriber,
		ShowMetricLabelNameValueSubscriber,
		ShowMetricLabelNodeNameSubscriber
{
	private static DEBOUNCE_TIME = 400
	private readonly applyDebouncedScaling: (newScaling: Vector3) => void

	private _viewModel: {
		scalingY: number
		invertHeight: boolean
		isDeltaState: boolean
		showMetricValue: boolean
		showNodeName: boolean
	} = {
		scalingY: null,
		invertHeight: null,
		isDeltaState: null,
		showMetricValue: true,
		showNodeName: true
	}

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		ScalingService.subscribe(this.$rootScope, this)
		InvertHeightService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
		LabelShowNodeNameService.subscribe(this.$rootScope, this)
		LabelShowMetricValueService.subscribe(this.$rootScope, this)

		this.applyDebouncedScaling = debounce(newScaling => {
			this.storeService.dispatch(setScaling(newScaling))
		}, HeightSettingsPanelController.DEBOUNCE_TIME)
	}

	onInvertHeightChanged(invertHeight: boolean) {
		this._viewModel.invertHeight = invertHeight
	}

	onShowMetricLabelNameValueChanged(showMetricValue: boolean) {
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

	applySettingsMetricLabelValueChanged() {
		this.storeService.dispatch(setShowMetricLabelNameValue(this._viewModel.showMetricValue))
	}

	applySettingsMetricLabelNodeNameChanged() {
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
