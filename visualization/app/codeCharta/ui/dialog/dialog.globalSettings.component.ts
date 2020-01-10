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

export class DialogGlobalSettingsController
	implements HideFlatBuildingsSubscriber, IsWhiteBackgroundSubscriber, ResetCameraIfNewFileIsLoadedSubscriber {
	private _viewModel: {
		hideFlatBuildings: boolean
		isWhiteBackground: boolean
		resetCameraIfNewFileIsLoaded: boolean
	} = {
		hideFlatBuildings: null,
		isWhiteBackground: null,
		resetCameraIfNewFileIsLoaded: null
	}

	constructor(private $mdDialog, private $rootScope: IRootScopeService, private storeService: StoreService) {
		HideFlatBuildingsService.subscribe(this.$rootScope, this)
		IsWhiteBackgroundService.subscribe(this.$rootScope, this)
		ResetCameraIfNewFileIsLoadedService.subscribe(this.$rootScope, this)
		this.initDialogOnClick()
	}

	private initDialogOnClick() {
		const appSettings = this.storeService.getState().appSettings
		this.onHideFlatBuildingsChanged(appSettings.hideFlatBuildings)
		this.onIsWhiteBackgroundChanged(appSettings.isWhiteBackground)
		this.onResetCameraIfNewFileIsLoadedChanged(appSettings.resetCameraIfNewFileIsLoaded)
	}

	public onHideFlatBuildingsChanged(hideFlatBuildings: boolean) {
		this._viewModel.hideFlatBuildings = hideFlatBuildings
	}

	public onIsWhiteBackgroundChanged(isWhiteBackground: boolean) {
		this._viewModel.isWhiteBackground = isWhiteBackground
	}

	public onResetCameraIfNewFileIsLoadedChanged(resetCameraIfNewFileIsLoaded: boolean) {
		this._viewModel.resetCameraIfNewFileIsLoaded = resetCameraIfNewFileIsLoaded
	}

	public applySettingsHideFlatBuildings() {
		this.storeService.dispatch(setHideFlatBuildings(this._viewModel.hideFlatBuildings))
	}

	public applySettingsResetCamera() {
		this.storeService.dispatch(setResetCameraIfNewFileIsLoaded(this._viewModel.resetCameraIfNewFileIsLoaded))
	}

	public applySettingsIsWhiteBackground() {
		this.storeService.dispatch(setIsWhiteBackground(this._viewModel.isWhiteBackground))
	}

	public hide() {
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
