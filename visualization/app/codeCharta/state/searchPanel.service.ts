import { IRootScopeService } from "angular"
import { SearchPanelMode } from "../model/codeCharta.model"

export interface SearchPanelServiceSubscriber {
	onSearchPanelModeChanged(searchPanelMode: SearchPanelMode)
}

export class SearchPanelService {
	public static readonly SEARCH_PANEL_MODE_EVENT = "search-panel-mode-changed"

	private searchPanelMode: SearchPanelMode = SearchPanelMode.minimized

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService) {}

	public updateSearchPanelMode(searchPanelMode: SearchPanelMode) {
		this.searchPanelMode = searchPanelMode
		this.notifySearchPanelModeChanged()
	}

	private notifySearchPanelModeChanged() {
		this.$rootScope.$broadcast(SearchPanelService.SEARCH_PANEL_MODE_EVENT, this.searchPanelMode)
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: SearchPanelServiceSubscriber) {
		$rootScope.$on(SearchPanelService.SEARCH_PANEL_MODE_EVENT, (event, data) => {
			subscriber.onSearchPanelModeChanged(data)
		})
	}
}
