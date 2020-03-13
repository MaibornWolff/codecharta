import "./searchPanel.component.scss"
import { IRootScopeService } from "angular"
import { SearchPanelMode } from "../../codeCharta.model"
import $ from "jquery"
import { StoreService } from "../../state/store.service"
import { setSearchPanelMode } from "../../state/store/appSettings/searchPanelMode/searchPanelMode.actions"
import { SearchPanelModeService, SearchPanelModeSubscriber } from "../../state/store/appSettings/searchPanelMode/searchPanelMode.service"

export class SearchPanelController implements SearchPanelModeSubscriber {
	private readonly EXPANDED_CLASS = "expanded"

	private _viewModel: {
		searchPanelMode: SearchPanelMode
	} = {
		searchPanelMode: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		SearchPanelModeService.subscribe(this.$rootScope, this)
	}

	public onSearchPanelModeChanged(searchPanelMode: SearchPanelMode) {
		const boxElement = $(event.srcElement).closest("md-card")
		if (searchPanelMode === SearchPanelMode.minimized) {
			boxElement.removeClass(this.EXPANDED_CLASS)
		} else {
			boxElement.addClass(this.EXPANDED_CLASS)
		}
		this._viewModel.searchPanelMode = searchPanelMode
	}

	public toggle() {
		if (this._viewModel.searchPanelMode !== SearchPanelMode.minimized) {
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
