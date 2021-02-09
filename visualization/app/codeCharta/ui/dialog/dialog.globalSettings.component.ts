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
import { LayoutAlgorithmService, LayoutAlgorithmSubscriber } from "../../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.service"
import { setLayoutAlgorithm } from "../../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.actions"
import { MaxTreeMapFilesService, MaxTreeMapFilesSubscriber } from "../../state/store/appSettings/maxTreeMapFiles/maxTreeMapFiles.service"
import { setMaxTreeMapFiles } from "../../state/store/appSettings/maxTreeMapFiles/maxTreeMapFiles.actions"
import { GlobalSettingsHelper } from "../../util/globalSettingsHelper"
import { SharpnessModeService, SharpnessModeSubscriber } from "../../state/store/appSettings/sharpnessMode/sharpnessMode.service"
import { setSharpnessMode } from "../../state/store/appSettings/sharpnessMode/sharpnessMode.actions"
import { CodeChartaStorage } from "../../util/codeChartaStorage"
import { FileDownloader } from "../../util/fileDownloader"
import { getVisibleFileStates, isSingleState } from "../../model/files/files.helper"
import { isStandalone } from "../../util/envDetector"

export class DialogGlobalSettingsController
	implements
		HideFlatBuildingsSubscriber,
		IsWhiteBackgroundSubscriber,
		ResetCameraIfNewFileIsLoadedSubscriber,
		ExperimentalFeaturesEnabledSubscriber,
		LayoutAlgorithmSubscriber,
		SharpnessModeSubscriber,
		MaxTreeMapFilesSubscriber {
	private _viewModel: {
		hideFlatBuildings: boolean
		isWhiteBackground: boolean
		resetCameraIfNewFileIsLoaded: boolean
		experimentalFeaturesEnabled: boolean
		layoutAlgorithm: LayoutAlgorithm
		maxTreeMapFiles: number
		sharpnessMode: SharpnessMode
	} = {
		hideFlatBuildings: null,
		isWhiteBackground: null,
		resetCameraIfNewFileIsLoaded: null,
		experimentalFeaturesEnabled: false,
		layoutAlgorithm: null,
		maxTreeMapFiles: null,
		sharpnessMode: null
	}

	constructor(private $mdDialog, private $rootScope: IRootScopeService, private storeService: StoreService) {
		HideFlatBuildingsService.subscribe(this.$rootScope, this)
		IsWhiteBackgroundService.subscribe(this.$rootScope, this)
		ResetCameraIfNewFileIsLoadedService.subscribe(this.$rootScope, this)
		ExperimentalFeaturesEnabledService.subscribe(this.$rootScope, this)
		LayoutAlgorithmService.subscribe(this.$rootScope, this)
		MaxTreeMapFilesService.subscribe(this.$rootScope, this)
		SharpnessModeService.subscribe(this.$rootScope, this)
		this.initDialogOnClick()
	}

	private initDialogOnClick() {
		const { appSettings } = this.storeService.getState()

		this.onHideFlatBuildingsChanged(appSettings.hideFlatBuildings)
		this.onIsWhiteBackgroundChanged(appSettings.isWhiteBackground)
		this.onResetCameraIfNewFileIsLoadedChanged(appSettings.resetCameraIfNewFileIsLoaded)
		this.onLayoutAlgorithmChanged(appSettings.layoutAlgorithm)
		this.onExperimentalFeaturesEnabledChanged(appSettings.experimentalFeaturesEnabled)
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

	onLayoutAlgorithmChanged(layoutAlgorithm: LayoutAlgorithm) {
		this._viewModel.layoutAlgorithm = layoutAlgorithm
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

	applySettingsAlgorithm() {
		this.storeService.dispatch(setLayoutAlgorithm(this._viewModel.layoutAlgorithm))
	}

	applySettingsMaxTreeMapFiles() {
		this.storeService.dispatch(setMaxTreeMapFiles(this._viewModel.maxTreeMapFiles))
	}

	applySettingsSharpnessMode() {
		this.storeService.dispatch(setSharpnessMode(this._viewModel.sharpnessMode))
	}

	mapTrackingDataAvailable() {
		const files = this.storeService.getState().files
		return isStandalone() && isSingleState(files) && getVisibleFileStates(files)
	}

	downloadTrackingData() {
		//TODO: this should be removed as soon as we send the data to a server
		const fileStorage = new CodeChartaStorage()

		// Make sure that only file within usageData can be read
		const fileChecksum = this.storeService.getState().files[0].file.fileMeta.fileChecksum.replace(/\//g, "")

		let trackedMapMetaData = ""
		try {
			trackedMapMetaData = fileStorage.getItem(`usageData/${fileChecksum}-meta`)
		} catch {
			// ignore, it no events item exists
		}

		FileDownloader.downloadData(trackedMapMetaData, `${fileChecksum}.tracking.json`)
	}

	hide() {
		this.$mdDialog.hide()
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
