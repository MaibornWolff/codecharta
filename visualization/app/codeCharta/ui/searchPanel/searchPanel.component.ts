import "./searchPanel.component.scss"
import { IRootScopeService } from "angular"
import { SearchPanelMode } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { setSearchPanelMode } from "../../state/store/appSettings/searchPanelMode/searchPanelMode.actions"
import { SearchPanelModeService, SearchPanelModeSubscriber } from "../../state/store/appSettings/searchPanelMode/searchPanelMode.service"
import { CodeChartaMouseEventService } from "../../codeCharta.mouseEvent.service"

export class SearchPanelController implements SearchPanelModeSubscriber {
	private _viewModel: {
		searchPanelMode: SearchPanelMode
		isExpanded: boolean
	} = {
		searchPanelMode: null,
		isExpanded: false
	}

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private codeChartaMouseEventService: CodeChartaMouseEventService
	) {
		SearchPanelModeService.subscribe(this.$rootScope, this)
		this.onSearchPanelModeChanged(SearchPanelMode.minimized)
	}

	onSearchPanelModeChanged(searchPanelMode: SearchPanelMode) {
		if (searchPanelMode === SearchPanelMode.minimized) {
			this._viewModel.isExpanded = false
		} else {
			this._viewModel.searchPanelMode = searchPanelMode
			this._viewModel.isExpanded = true
		}
	}

	toggle() {
		if (this._viewModel.isExpanded) {
			this.storeService.dispatch(setSearchPanelMode(SearchPanelMode.minimized))
		} else {
			this.storeService.dispatch(setSearchPanelMode(SearchPanelMode.treeView))
		}
		this.codeChartaMouseEventService.closeComponentsExceptCurrent(this.codeChartaMouseEventService.closeSearchPanel)
	}

	openSearchPanel() {
		this.storeService.dispatch(setSearchPanelMode(SearchPanelMode.treeView))
	}
}

export const searchPanelComponent = {
	selector: "searchPanelComponent",
	template: require("./searchPanel.component.html"),
	controller: SearchPanelController
}
