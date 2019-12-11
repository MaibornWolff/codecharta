import "./searchPanelModeSelector.component.scss"
import { SearchPanelMode, BlacklistType, BlacklistItem } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { SearchPanelServiceSubscriber, SearchPanelService } from "../../state/searchPanel.service"
import { BlacklistSubscriber, SearchPatternSubscriber } from "../../state/settingsService/settings.service.events"
import { SearchPatternService } from "../../state/store/dynamicSettings/searchPattern/searchPattern.service"
import { BlacklistService } from "../../state/store/fileSettings/blacklist/blacklist.service"

export class SearchPanelModeSelectorController implements SearchPatternSubscriber, BlacklistSubscriber, SearchPanelServiceSubscriber {
	private _viewModel: {
		searchPanelMode: SearchPanelMode
		flattenListLength: number
		excludeListLength: number
		searchFieldIsEmpty: boolean
	} = {
		searchPanelMode: SearchPanelMode.minimized,
		flattenListLength: 0,
		excludeListLength: 0,
		searchFieldIsEmpty: true
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private searchPanelService: SearchPanelService) {
		SearchPatternService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
		SearchPanelService.subscribe(this.$rootScope, this)
	}

	public onSearchPatternChanged(searchPattern: string) {
		this._viewModel.searchFieldIsEmpty = searchPattern === ""
	}

	public onBlacklistChanged(blacklist: BlacklistItem[]) {
		this._viewModel.flattenListLength = blacklist.filter(x => x.type === BlacklistType.flatten).length
		this._viewModel.excludeListLength = blacklist.filter(x => x.type === BlacklistType.exclude).length
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
