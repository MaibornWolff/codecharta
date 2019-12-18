import { SettingsService } from "../../state/settingsService/settings.service"
import { Settings, RecursivePartial } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { SettingsServiceSubscriber } from "../../state/settingsService/settings.service.events"
import { StoreService } from "../../state/store.service"
import { setHideFlatBuildings } from "../../state/store/appSettings/hideFlatBuildings/hideFlatBuildings.actions"
import { setResetCameraIfNewFileIsLoaded } from "../../state/store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"
import { setIsWhiteBackground } from "../../state/store/appSettings/isWhiteBackground/isWhiteBackground.actions"

export class DialogGlobalSettingsController implements SettingsServiceSubscriber {
	private _viewModel: {
		hideFlatBuildings: boolean
		isWhiteBackground: boolean
		resetCameraIfNewFileIsLoaded: boolean
	} = {
		hideFlatBuildings: null,
		isWhiteBackground: null,
		resetCameraIfNewFileIsLoaded: null
	}

	constructor(
		private $mdDialog,
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private settingsService: SettingsService
	) {
		SettingsService.subscribe(this.$rootScope, this)
		this.updateSettingsFields()
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>) {
		this.updateSettingsFields(settings)
	}

	private updateSettingsFields(settings: Settings = this.settingsService.getSettings()) {
		this._viewModel.hideFlatBuildings = settings.appSettings.hideFlatBuildings
		this._viewModel.isWhiteBackground = settings.appSettings.isWhiteBackground
		this._viewModel.resetCameraIfNewFileIsLoaded = settings.appSettings.resetCameraIfNewFileIsLoaded
	}

	public applySettingsHideFlatBuildings() {
		this.settingsService.updateSettings({
			appSettings: {
				hideFlatBuildings: this._viewModel.hideFlatBuildings
			}
		})
		this.storeService.dispatch(setHideFlatBuildings(this._viewModel.hideFlatBuildings))
	}

	public applySettingsResetCamera() {
		this.settingsService.updateSettings({
			appSettings: {
				resetCameraIfNewFileIsLoaded: this._viewModel.resetCameraIfNewFileIsLoaded
			}
		})
		this.storeService.dispatch(setResetCameraIfNewFileIsLoaded(this._viewModel.resetCameraIfNewFileIsLoaded))
	}

	public applySettingsIsWhiteBackground() {
		this.settingsService.updateSettings({
			appSettings: {
				isWhiteBackground: this._viewModel.isWhiteBackground
			}
		})
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
