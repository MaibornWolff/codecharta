import "./searchPanelModeSelector.component.scss"
import { BlacklistItem, BlacklistType, SearchPanelMode } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { SearchPatternService, SearchPatternSubscriber } from "../../state/store/dynamicSettings/searchPattern/searchPattern.service"
import { BlacklistService, BlacklistSubscriber } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { StoreService } from "../../state/store.service"
import { setSearchPanelMode } from "../../state/store/appSettings/searchPanelMode/searchPanelMode.actions"
import { SearchPanelModeService, SearchPanelModeSubscriber } from "../../state/store/appSettings/searchPanelMode/searchPanelMode.service"

export class SearchPanelModeSelectorController implements SearchPatternSubscriber, BlacklistSubscriber, SearchPanelModeSubscriber {
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
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		SearchPatternService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
		SearchPanelModeService.subscribe(this.$rootScope, this)
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

	public onToggleSearchPanelMode(searchPanelMode: SearchPanelMode) {
		if (searchPanelMode === this._viewModel.searchPanelMode) {
			this.storeService.dispatch(setSearchPanelMode(SearchPanelMode.minimized))
		} else {
			this.storeService.dispatch(setSearchPanelMode(searchPanelMode))
		}
	}
}

export const searchPanelModeSelectorComponent = {
	selector: "searchPanelModeSelectorComponent",
	template: require("./searchPanelModeSelector.component.html"),
	controller: SearchPanelModeSelectorController
}
