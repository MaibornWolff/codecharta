import { SettingsService, SettingsServiceSubscriber } from "../../state/settings.service"
import "./optionsPanel.component.scss"
import { IRootScopeService } from "angular"
import { Settings, RecursivePartial, AppSettings } from "../../codeCharta.model"
import _ from "lodash"

export class OptionsPanelController implements SettingsServiceSubscriber {
	private _viewModel: {
		enableEdgeArrows: boolean
		hideFlatBuildings: boolean
		maximizeDetailPanel: boolean
		isWhiteBackground: boolean
	}

	constructor($rootScope: IRootScopeService, private settingsService: SettingsService) {
		SettingsService.subscribe($rootScope, this)
	}

	public onSettingsChanged(settings: Settings) {
		const interestingKeys = _.keys(this._viewModel)
		const viewModelUpdate = _.pick(settings.appSettings, interestingKeys)
		_.assign(this._viewModel, viewModelUpdate)
	}

	public updateSettings(update: RecursivePartial<AppSettings> = this._viewModel) {
		this.settingsService.updateSettings({
			appSettings: update
		})
	}
}

export const optionsPanelComponent = {
	selector: "optionsPanelComponent",
	template: require("./optionsPanel.component.html"),
	controller: OptionsPanelController
}
