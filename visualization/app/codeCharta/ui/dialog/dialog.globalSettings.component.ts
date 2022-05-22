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
import { LayoutAlgorithm, SharpnessMode } from "../../codeCharta.model"
import { setLayoutAlgorithm } from "../../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.actions"
import { GlobalSettingsHelper } from "../../util/globalSettingsHelper"
import { setScreenshotToClipboardEnabled } from "../../state/store/appSettings/enableClipboard/screenshotToClipboardEnabled.actions"
import {
	ScreenshotToClipboardEnabledService,
	ScreenshotToClipboardEnabledSubscriber
} from "../../state/store/appSettings/enableClipboard/screenshotToClipboardEnabled.service"

export class DialogGlobalSettingsController
	implements
		HideFlatBuildingsSubscriber,
		IsWhiteBackgroundSubscriber,
		ResetCameraIfNewFileIsLoadedSubscriber,
		ExperimentalFeaturesEnabledSubscriber,
		ScreenshotToClipboardEnabledSubscriber
{
	private _viewModel: {
		hideFlatBuildings: boolean
		isWhiteBackground: boolean
		resetCameraIfNewFileIsLoaded: boolean
		experimentalFeaturesEnabled: boolean
		screenshotToClipboardEnabled: boolean
		layoutAlgorithm: LayoutAlgorithm
		maxTreeMapFiles: number
		sharpnessMode: SharpnessMode
	} = {
		hideFlatBuildings: null,
		isWhiteBackground: null,
		resetCameraIfNewFileIsLoaded: null,
		experimentalFeaturesEnabled: false,
		screenshotToClipboardEnabled: null,
		layoutAlgorithm: null,
		maxTreeMapFiles: null,
		sharpnessMode: null
	}

	constructor(private $mdDialog, private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		HideFlatBuildingsService.subscribe(this.$rootScope, this)
		IsWhiteBackgroundService.subscribe(this.$rootScope, this)
		ResetCameraIfNewFileIsLoadedService.subscribe(this.$rootScope, this)
		ExperimentalFeaturesEnabledService.subscribe(this.$rootScope, this)
		ScreenshotToClipboardEnabledService.subscribe(this.$rootScope, this)

		const { appSettings } = this.storeService.getState()

		this.onHideFlatBuildingsChanged(appSettings.hideFlatBuildings)
		this.onIsWhiteBackgroundChanged(appSettings.isWhiteBackground)
		this.onResetCameraIfNewFileIsLoadedChanged(appSettings.resetCameraIfNewFileIsLoaded)
		this.onExperimentalFeaturesEnabledChanged(appSettings.experimentalFeaturesEnabled)
		this.onScreenshotToClipboardEnabledChanged(appSettings.screenshotToClipboardEnabled)
		this.onMaxTreeMapFilesChanged(appSettings.maxTreeMapFiles)
		this.onSharpnessModeChanged(appSettings.sharpnessMode)
	}

	onHideFlatBuildingsChanged(hideFlatBuildings: boolean) {
		this._viewModel.hideFlatBuildings = hideFlatBuildings
		this.changeGlobalSettingsInLocalStorage()
	}

	onIsWhiteBackgroundChanged(isWhiteBackground: boolean) {
		this._viewModel.isWhiteBackground = isWhiteBackground
		this.changeGlobalSettingsInLocalStorage()
	}

	onResetCameraIfNewFileIsLoadedChanged(resetCameraIfNewFileIsLoaded: boolean) {
		this._viewModel.resetCameraIfNewFileIsLoaded = resetCameraIfNewFileIsLoaded
		this.changeGlobalSettingsInLocalStorage()
	}

	onMaxTreeMapFilesChanged(maxTreeMapFiles: number) {
		this._viewModel.maxTreeMapFiles = maxTreeMapFiles
		this.changeGlobalSettingsInLocalStorage()
	}

	onSharpnessModeChanged(sharpnessMode: SharpnessMode) {
		this._viewModel.sharpnessMode = sharpnessMode
		this.changeGlobalSettingsInLocalStorage()
	}

	onScreenshotToClipboardEnabledChanged(screenshotToClipboardEnabled: boolean) {
		this._viewModel.screenshotToClipboardEnabled = screenshotToClipboardEnabled
		this.changeGlobalSettingsInLocalStorage()
	}

	onExperimentalFeaturesEnabledChanged(experimentalFeaturesEnabled: boolean) {
		this._viewModel.experimentalFeaturesEnabled = experimentalFeaturesEnabled
		this.changeGlobalSettingsInLocalStorage()
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

	applySettingsEnableScreenshotToClipboardFeatures() {
		this.storeService.dispatch(setScreenshotToClipboardEnabled(this._viewModel.screenshotToClipboardEnabled))
	}

	applySettingsAlgorithm() {
		this.storeService.dispatch(setLayoutAlgorithm(this._viewModel.layoutAlgorithm))
	}

	changeGlobalSettingsInLocalStorage() {
		GlobalSettingsHelper.setGlobalSettingsInLocalStorage({ ...this._viewModel })
	}
}

export const dialogGlobalSettingsComponent = {
	selector: "dialogGlobalSettingsComponent",
	template: require("./dialog.globalSettings.component.html"),
	controller: DialogGlobalSettingsController,
	clickOutsideToClose: true,
	controllerAs: "$ctrl"
}
