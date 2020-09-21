import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { SearchedNodePathsActions } from "./searchedNodePaths.actions"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface SearchedNodePathsSubscriber {
	onSearchedNodePathsChanged(searchedNodePaths: string[])
}

export class SearchedNodePathsService implements StoreSubscriber {
	private static SEARCHED_NODE_PATHS_CHANGED_EVENT = "searched-node-paths-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, SearchedNodePathsActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().dynamicSettings.searchedNodePaths
	}

	private notify(newState: Set<string>) {
		this.$rootScope.$broadcast(SearchedNodePathsService.SEARCHED_NODE_PATHS_CHANGED_EVENT, {
			searchedNodePaths: newState
		})
	}

	static subscribe($rootScope: IRootScopeService, subscriber: SearchedNodePathsSubscriber) {
		$rootScope.$on(SearchedNodePathsService.SEARCHED_NODE_PATHS_CHANGED_EVENT, (_event_, data) => {
			subscriber.onSearchedNodePathsChanged(data.searchedNodePaths)
		})
	}
}
