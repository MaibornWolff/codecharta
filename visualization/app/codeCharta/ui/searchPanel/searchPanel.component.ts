import "./searchPanel.component.scss"
import { IRootScopeService, ITimeoutService } from "angular"
import { SearchPanelMode } from "../../codeCharta.model"
import $ from "jquery"
import { StoreService } from "../../state/store.service"
import { setSearchPanelMode } from "../../state/store/appSettings/searchPanelMode/searchPanelMode.actions"
import { SearchPanelModeService, SearchPanelModeSubscriber } from "../../state/store/appSettings/searchPanelMode/searchPanelMode.service"

export class SearchPanelController implements SearchPanelModeSubscriber {
	private collapsingElements = $("search-panel-component md-card")

	private _viewModel: {
		searchPanelMode: SearchPanelMode
	} = {
		searchPanelMode: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private $timeout: ITimeoutService, private storeService: StoreService) {
		SearchPanelModeService.subscribe(this.$rootScope, this)
	}

	public onSearchPanelModeChanged(searchPanelMode: SearchPanelMode) {
		this._viewModel.searchPanelMode = searchPanelMode
		this.collapsingElements.attr("id", "")
		this.$timeout(() => this.collapsingElements.attr("id", "search-panel"), 300)
	}

	public toggle() {
		if (this._viewModel.searchPanelMode != SearchPanelMode.minimized) {
			this.storeService.dispatch(setSearchPanelMode(SearchPanelMode.minimized))
		} else {
			this.storeService.dispatch(setSearchPanelMode(SearchPanelMode.treeView))
		}
	}
}

export const searchPanelComponent = {
	selector: "searchPanelComponent",
	template: require("./searchPanel.component.html"),
	controller: SearchPanelController
}
