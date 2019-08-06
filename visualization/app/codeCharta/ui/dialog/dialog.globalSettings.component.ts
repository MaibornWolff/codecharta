import { SettingsService, SettingsServiceSubscriber } from "../../state/settings.service"
import { Settings, RecursivePartial, AppSettings } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import _ from "lodash"

export class DialogGlobalSettingsController implements SettingsServiceSubscriber {
	private _viewModel: {
		enableEdgeArrows: boolean
		hideFlatBuildings: boolean
		maximizeDetailPanel: boolean
		isWhiteBackground: boolean
	} = {
		enableEdgeArrows: null,
		hideFlatBuildings: null,
		maximizeDetailPanel: null,
		isWhiteBackground: null
	}

	constructor(private $mdDialog, private $rootScope: IRootScopeService, private settingsService: SettingsService) {
		SettingsService.subscribe(this.$rootScope, this)
		this.updateSettingsFields()
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>) {
		this.updateSettingsFields(settings)
	}

	public updateSettingsFields(s: Settings = this.settingsService.getSettings()) {
		const interestingKeys = _.keys(this._viewModel)
		const viewModelUpdate = _.pick(s.appSettings, interestingKeys)
		_.assign(this._viewModel, viewModelUpdate)
	}

	public applySettings(update: RecursivePartial<AppSettings> = this._viewModel) {
		this.settingsService.updateSettings({
			appSettings: update
		})
	}

	public hide() {
		this.$mdDialog.hide()
	}
}

export const dialogGlobalSettingsComponent = {
	clickOutsideToClose: true,
	template: require("./dialog.globalSettings.component.html"),
	controller: DialogGlobalSettingsController,
	controllerAs: "$ctrl"
}
