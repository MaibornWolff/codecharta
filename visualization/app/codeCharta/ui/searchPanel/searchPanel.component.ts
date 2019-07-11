import "./searchPanel.component.scss"
import { SettingsService, SettingsServiceSubscriber } from "../../state/settings.service"
import { IRootScopeService, IAngularEvent } from "angular"
import { Settings, RecursivePartial, SearchPanelMode } from "../../codeCharta.model"
import $ from "jquery"

export class SearchPanelController implements SettingsServiceSubscriber {
	private settingsService: SettingsService

	private objectToAnimate = $("#search")

	private _viewModel: { searchPanelMode: SearchPanelMode } = {
		searchPanelMode: SearchPanelMode.minimized
	}

	/* @ngInject */
	constructor($rootScope: IRootScopeService, settingsService: SettingsService) {
		SettingsService.subscribe($rootScope, this)
		this.settingsService = settingsService
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>, event: IAngularEvent) {
		if (this.isSearchPanelModeUpdated(update)) {
			this.objectToAnimate.attr("id", "header")
			this._viewModel.searchPanelMode = update.dynamicSettings.searchPanelMode
			setTimeout(() => this.objectToAnimate.attr("id", "search"), 500)
		}
	}

	private isSearchPanelModeUpdated(update: RecursivePartial<Settings>) {
		return update.dynamicSettings && update.dynamicSettings.searchPanelMode !== undefined
	}

	public toggle() {
		if (this._viewModel.searchPanelMode != SearchPanelMode.minimized) {
			this.settingsService.updateSettings({ dynamicSettings: { searchPanelMode: SearchPanelMode.minimized } })
		} else {
			this.settingsService.updateSettings({ dynamicSettings: { searchPanelMode: SearchPanelMode.treeView } })
		}
	}
}

export const searchPanelComponent = {
	selector: "searchPanelComponent",
	template: require("./searchPanel.component.html"),
	controller: SearchPanelController
}
