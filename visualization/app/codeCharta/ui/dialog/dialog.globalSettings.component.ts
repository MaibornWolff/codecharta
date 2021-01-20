import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { setHideFlatBuildings } from "../../state/store/appSettings/hideFlatBuildings/hideFlatBuildings.actions"
import { setResetCameraIfNewFileIsLoaded } from "../../state/store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"
import { setIsWhiteBackground } from "../../state/store/appSettings/isWhiteBackground/isWhiteBackground.actions"
import {
	HideFlatBuildingsService,
	HideFlatBuildingsSubscriber
} from "../../state/store/appSettings/hideFlatBuildings/hideFlatBuildings.service"
import {
	IsWhiteBackgroundService,
	IsWhiteBackgroundSubscriber
} from "../../state/store/appSettings/isWhiteBackground/isWhiteBackground.service"
import {
	ResetCameraIfNewFileIsLoadedService,
	ResetCameraIfNewFileIsLoadedSubscriber
} from "../../state/store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.service"
import { setExperimentalFeaturesEnabled } from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import {
	ExperimentalFeaturesEnabledService,
	ExperimentalFeaturesEnabledSubscriber
} from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.service"
import { LayoutAlgorithm } from "../../codeCharta.model"
import { LayoutAlgorithmService, LayoutAlgorithmSubscriber } from "../../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.service"
import { setLayoutAlgorithm } from "../../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.actions"
import { MaxTreeMapFilesService, MaxTreeMapFilesSubscriber } from "../../state/store/appSettings/maxTreeMapFiles/maxTreeMapFiles.service"
import { setMaxTreeMapFiles } from "../../state/store/appSettings/maxTreeMapFiles/maxTreeMapFiles.actions"
import { setTrackingDataEnabled } from "../../state/store/appSettings/enableTrackingData/trackingDataEnabled.actions"
import {
	TrackingDataEnabledService,
	TrackingDataEnabledSubscriber
} from "../../state/store/appSettings/enableTrackingData/trackingDataEnabled.service"

export class DialogGlobalSettingsController
	implements
		HideFlatBuildingsSubscriber,
		IsWhiteBackgroundSubscriber,
		ResetCameraIfNewFileIsLoadedSubscriber,
		ExperimentalFeaturesEnabledSubscriber,
		TrackingDataEnabledSubscriber,
		LayoutAlgorithmSubscriber,
		MaxTreeMapFilesSubscriber {
	private _viewModel: {
		hideFlatBuildings: boolean
		isWhiteBackground: boolean
		resetCameraIfNewFileIsLoaded: boolean
		experimentalFeaturesEnabled: boolean
		trackingDataEnabled: boolean
		layoutAlgorithm: LayoutAlgorithm
		maxTreeMapFiles: number
	} = {
		hideFlatBuildings: null,
		isWhiteBackground: null,
		resetCameraIfNewFileIsLoaded: null,
		experimentalFeaturesEnabled: false,
		trackingDataEnabled: false,
		layoutAlgorithm: null,
		maxTreeMapFiles: null
	}

	constructor(private $mdDialog, private $rootScope: IRootScopeService, private storeService: StoreService) {
		HideFlatBuildingsService.subscribe(this.$rootScope, this)
		IsWhiteBackgroundService.subscribe(this.$rootScope, this)
		ResetCameraIfNewFileIsLoadedService.subscribe(this.$rootScope, this)
		ExperimentalFeaturesEnabledService.subscribe(this.$rootScope, this)
		TrackingDataEnabledService.subscribe(this.$rootScope, this)
		LayoutAlgorithmService.subscribe(this.$rootScope, this)
		MaxTreeMapFilesService.subscribe(this.$rootScope, this)
		this.initDialogOnClick()
	}

	private initDialogOnClick() {
		const { appSettings } = this.storeService.getState()

		this.onHideFlatBuildingsChanged(appSettings.hideFlatBuildings)
		this.onIsWhiteBackgroundChanged(appSettings.isWhiteBackground)
		this.onResetCameraIfNewFileIsLoadedChanged(appSettings.resetCameraIfNewFileIsLoaded)
		this.onLayoutAlgorithmChanged(appSettings.layoutAlgorithm)
		this.onExperimentalFeaturesEnabledChanged(appSettings.experimentalFeaturesEnabled)
		this.onTrackingDataEnabledChanged(appSettings.trackingDataEnabled)
	}

	onHideFlatBuildingsChanged(hideFlatBuildings: boolean) {
		this._viewModel.hideFlatBuildings = hideFlatBuildings
	}

	onIsWhiteBackgroundChanged(isWhiteBackground: boolean) {
		this._viewModel.isWhiteBackground = isWhiteBackground
	}

	onResetCameraIfNewFileIsLoadedChanged(resetCameraIfNewFileIsLoaded: boolean) {
		this._viewModel.resetCameraIfNewFileIsLoaded = resetCameraIfNewFileIsLoaded
	}

	onLayoutAlgorithmChanged(layoutAlgorithm: LayoutAlgorithm) {
		this._viewModel.layoutAlgorithm = layoutAlgorithm
	}

	onMaxTreeMapFilesChanged(maxTreeMapFiles: number) {
		this._viewModel.maxTreeMapFiles = maxTreeMapFiles
	}

	onExperimentalFeaturesEnabledChanged(experimentalFeaturesEnabled: boolean) {
		this._viewModel.experimentalFeaturesEnabled = experimentalFeaturesEnabled
	}

	onTrackingDataEnabledChanged(trackingDataEnabled: boolean) {
		this._viewModel.trackingDataEnabled = trackingDataEnabled
	}

	applySettingsHideFlatBuildings() {
		this.storeService.dispatch(setHideFlatBuildings(this._viewModel.hideFlatBuildings))
	}

	applySettingsResetCamera() {
		this.storeService.dispatch(setResetCameraIfNewFileIsLoaded(this._viewModel.resetCameraIfNewFileIsLoaded))
	}

	applySettingsIsWhiteBackground() {
		this.storeService.dispatch(setIsWhiteBackground(this._viewModel.isWhiteBackground))
	}

	applySettingsEnableExperimentalFeatures() {
		this.storeService.dispatch(setExperimentalFeaturesEnabled(this._viewModel.experimentalFeaturesEnabled))
	}

	applySettingsEnableTrackingData() {
		this.storeService.dispatch(setTrackingDataEnabled(this._viewModel.trackingDataEnabled))
	}

	applySettingsAlgorithm() {
		this.storeService.dispatch(setLayoutAlgorithm(this._viewModel.layoutAlgorithm))
	}

	applySettingsMaxTreeMapFiles() {
		this.storeService.dispatch(setMaxTreeMapFiles(this._viewModel.maxTreeMapFiles))
	}

	hide() {
		this.$mdDialog.hide()
	}
}

export const dialogGlobalSettingsComponent = {
	selector: "dialogGlobalSettingsComponent",
	template: require("./dialog.globalSettings.component.html"),
	controller: DialogGlobalSettingsController,
	clickOutsideToClose: true,
	controllerAs: "$ctrl"
}
