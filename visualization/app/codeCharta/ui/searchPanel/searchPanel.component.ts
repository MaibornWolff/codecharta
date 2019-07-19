import "./searchPanel.component.scss"
import { IRootScopeService, ITimeoutService } from "angular"
import { SearchPanelMode } from "../../codeCharta.model"
import $ from "jquery"
import { SearchPanelServiceSubscriber, SearchPanelService } from "../../state/searchPanel.service"

export class SearchPanelController implements SearchPanelServiceSubscriber {
	private collapsingElements = $("search-panel-component md-card")

	private _viewModel: {
		searchPanelMode: SearchPanelMode
	} = {
		searchPanelMode: SearchPanelMode.minimized
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private $timeout: ITimeoutService, private searchPanelService: SearchPanelService) {
		SearchPanelService.subscribe(this.$rootScope, this)
	}

	public onSearchPanelModeChanged(searchPanelMode: SearchPanelMode) {
		this._viewModel.searchPanelMode = searchPanelMode
		this.collapsingElements.attr("id", "")
		this.$timeout(() => this.collapsingElements.attr("id", "search-panel"), 500)
	}

	public toggle() {
		if (this._viewModel.searchPanelMode != SearchPanelMode.minimized) {
			this.searchPanelService.updateSearchPanelMode(SearchPanelMode.minimized)
		} else {
			this.searchPanelService.updateSearchPanelMode(SearchPanelMode.treeView)
		}
	}
}

export const searchPanelComponent = {
	selector: "searchPanelComponent",
	template: require("./searchPanel.component.html"),
	controller: SearchPanelController
}
