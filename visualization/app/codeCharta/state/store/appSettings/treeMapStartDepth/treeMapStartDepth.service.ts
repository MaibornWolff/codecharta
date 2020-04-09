import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { TreeMapStartDepthActions } from "./treeMapStartDepth.actions"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface TreeMapStartDepthSubscriber {
	onTreeMapStartDepthChanged(treeMapStartDepth: number)
}

export class TreeMapStartDepthService implements StoreSubscriber {
	private static TREE_MAP_START_DEPTH_CHANGED_EVENT = "tree-map-start-depth-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, TreeMapStartDepthActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.treeMapStartDepth
	}

	private notify(newState: number) {
		this.$rootScope.$broadcast(TreeMapStartDepthService.TREE_MAP_START_DEPTH_CHANGED_EVENT, { treeMapStartDepth: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: TreeMapStartDepthSubscriber) {
		$rootScope.$on(TreeMapStartDepthService.TREE_MAP_START_DEPTH_CHANGED_EVENT, (event, data) => {
			subscriber.onTreeMapStartDepthChanged(data.treeMapStartDepth)
		})
	}
}
