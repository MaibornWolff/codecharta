import "./searchPanel.component.scss"
import { IRootScopeService, IAngularEvent } from "angular"
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
	constructor(private $rootScope: IRootScopeService, private searchPanelService: SearchPanelService) {
		SearchPanelService.subscribe(this.$rootScope, this)
	}

	public onSearchPanelModeChanged(searchPanelMode: SearchPanelMode, event: IAngularEvent) {
		this._viewModel.searchPanelMode = searchPanelMode

		if (searchPanelMode === SearchPanelMode.minimized) {
			this.collapsingElements.removeClass("expanded")
		} else {
			this.collapsingElements.addClass("expanded")
		}
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
