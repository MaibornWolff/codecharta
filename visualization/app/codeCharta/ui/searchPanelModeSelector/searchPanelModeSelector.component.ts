import "./searchPanelModeSelector.component.scss"
import { SettingsServiceSubscriber, SettingsService } from "../../state/settings.service"
import { Settings, RecursivePartial, SearchPanelMode, BlacklistType } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { SearchPanelServiceSubscriber, SearchPanelService } from "../../state/searchPanel.service"

export class SearchPanelModeSelectorController implements SettingsServiceSubscriber, SearchPanelServiceSubscriber {
	private _viewModel: {
		searchPanelMode: SearchPanelMode
		hideListLength: number
		excludeListLength: number
		searchFieldIsEmpty: boolean
	} = {
		searchPanelMode: SearchPanelMode.minimized,
		hideListLength: 0,
		excludeListLength: 0,
		searchFieldIsEmpty: true
	}

	/* @ngInject */
	constructor(private searchPanelService: SearchPanelService, private $rootScope: IRootScopeService) {
		SettingsService.subscribe(this.$rootScope, this)
		SearchPanelService.subscribe(this.$rootScope, this)
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>) {
		this._viewModel.hideListLength = settings.fileSettings.blacklist.filter(x => x.type === BlacklistType.hide).length
		this._viewModel.excludeListLength = settings.fileSettings.blacklist.filter(x => x.type === BlacklistType.exclude).length
		this._viewModel.searchFieldIsEmpty = settings.dynamicSettings.searchPattern === ""
	}

	public onSearchPanelModeChanged(searchPanelMode: SearchPanelMode) {
		this._viewModel.searchPanelMode = searchPanelMode
	}

	public onToggleSearchPanelMode(toggleView: SearchPanelMode) {
		if (toggleView === this._viewModel.searchPanelMode) {
			this._viewModel.searchPanelMode = SearchPanelMode.minimized
		} else {
			this._viewModel.searchPanelMode = toggleView
		}

		this.searchPanelService.updateSearchPanelMode(this._viewModel.searchPanelMode)
	}
}

export const searchPanelModeSelectorComponent = {
	selector: "searchPanelModeSelectorComponent",
	template: require("./searchPanelModeSelector.component.html"),
	controller: SearchPanelModeSelectorController
}
