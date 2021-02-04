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
import { CodeChartaStorage } from "../../util/codeChartaStorage"
import { FileDownloader } from "../../util/fileDownloader"
import { getVisibleFileStates, isSingleState } from "../../model/files/files.helper"
import { isStandalone } from "../../util/envDetector"

export class DialogGlobalSettingsController
	implements
		HideFlatBuildingsSubscriber,
		IsWhiteBackgroundSubscriber,
		ResetCameraIfNewFileIsLoadedSubscriber,
		ExperimentalFeaturesEnabledSubscriber {
	private _viewModel: {
		hideFlatBuildings: boolean
		isWhiteBackground: boolean
		resetCameraIfNewFileIsLoaded: boolean
		experimentalFeaturesEnabled: boolean
	} = {
		hideFlatBuildings: null,
		isWhiteBackground: null,
		resetCameraIfNewFileIsLoaded: null,
		experimentalFeaturesEnabled: false
	}

	constructor(private $mdDialog, private $rootScope: IRootScopeService, private storeService: StoreService) {
		HideFlatBuildingsService.subscribe(this.$rootScope, this)
		IsWhiteBackgroundService.subscribe(this.$rootScope, this)
		ResetCameraIfNewFileIsLoadedService.subscribe(this.$rootScope, this)
		ExperimentalFeaturesEnabledService.subscribe(this.$rootScope, this)

		this.initDialogOnClick()
	}

	private initDialogOnClick() {
		const { appSettings } = this.storeService.getState()

		this.onHideFlatBuildingsChanged(appSettings.hideFlatBuildings)
		this.onIsWhiteBackgroundChanged(appSettings.isWhiteBackground)
		this.onResetCameraIfNewFileIsLoadedChanged(appSettings.resetCameraIfNewFileIsLoaded)
		this.onExperimentalFeaturesEnabledChanged(appSettings.experimentalFeaturesEnabled)
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

	onExperimentalFeaturesEnabledChanged(experimentalFeaturesEnabled: boolean) {
		this._viewModel.experimentalFeaturesEnabled = experimentalFeaturesEnabled
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
}

export const dialogGlobalSettingsComponent = {
	selector: "dialogGlobalSettingsComponent",
	template: require("./dialog.globalSettings.component.html"),
	controller: DialogGlobalSettingsController,
	clickOutsideToClose: true,
	controllerAs: "$ctrl"
}
