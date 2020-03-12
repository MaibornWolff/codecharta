import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { SearchPanelModeActions } from "./searchPanelMode.actions"
import _ from "lodash"
import { SearchPanelMode } from "../../../../codeCharta.model"

export interface SearchPanelModeSubscriber {
	onSearchPanelModeChanged(searchPanelMode: SearchPanelMode)
}

export class SearchPanelModeService implements StoreSubscriber {
	private static SEARCH_PANEL_MODE_CHANGED_EVENT = "search-panel-mode-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(SearchPanelModeActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.searchPanelMode
	}

	private notify(newState: SearchPanelMode) {
		this.$rootScope.$broadcast(SearchPanelModeService.SEARCH_PANEL_MODE_CHANGED_EVENT, { searchPanelMode: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: SearchPanelModeSubscriber) {
		$rootScope.$on(SearchPanelModeService.SEARCH_PANEL_MODE_CHANGED_EVENT, (event, data) => {
			subscriber.onSearchPanelModeChanged(data.searchPanelMode)
		})
	}
}
