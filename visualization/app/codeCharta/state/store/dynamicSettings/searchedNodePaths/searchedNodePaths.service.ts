import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { SearchedNodePathsActions } from "./searchedNodePaths.actions"
import _ from "lodash"

export interface SearchedNodePathsSubscriber {
	onSearchedNodePathsChanged(searchedNodePaths: string[])
}

export class SearchedNodePathsService implements StoreSubscriber {
	private static SEARCHED_NODE_PATHS_CHANGED_EVENT = "searched-node-paths-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe($rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(SearchedNodePathsActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().dynamicSettings.searchedNodePaths
	}

	private notify(newState: string[]) {
		this.$rootScope.$broadcast(SearchedNodePathsService.SEARCHED_NODE_PATHS_CHANGED_EVENT, { searchedNodePaths: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: SearchedNodePathsSubscriber) {
		$rootScope.$on(SearchedNodePathsService.SEARCHED_NODE_PATHS_CHANGED_EVENT, (event, data) => {
			subscriber.onSearchedNodePathsChanged(data.searchedNodePaths)
		})
	}
}
