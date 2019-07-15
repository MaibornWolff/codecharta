import "./searchPanel.component.scss"
import { IRootScopeService, IAngularEvent } from "angular"
import { SearchPanelMode } from "../../codeCharta.model"
import $ from "jquery"
import { SearchPanelServiceSubscriber, SearchPanelService } from "../../state/searchPanel.service"

export class SearchPanelController implements SearchPanelServiceSubscriber {
	private searchPanelService: SearchPanelService

	private objectToAnimate = $("#search")

	private _viewModel: { searchPanelMode: SearchPanelMode } = {
		searchPanelMode: SearchPanelMode.minimized
	}

	/* @ngInject */
	constructor($rootScope: IRootScopeService, searchPanelService: SearchPanelService) {
		SearchPanelService.subscribe($rootScope, this)
		this.searchPanelService = searchPanelService
	}

	public onSearchPanelModeChanged(searchPanelMode: SearchPanelMode, event: IAngularEvent) {
		this.objectToAnimate.attr("id", "")
		this._viewModel.searchPanelMode = searchPanelMode
		setTimeout(() => this.objectToAnimate.attr("id", "search"), 500)
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
