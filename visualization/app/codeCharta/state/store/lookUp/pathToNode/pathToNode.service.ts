import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { PathToNodeActions } from "./pathToNode.actions"
import { isActionOfType } from "../../../../util/reduxHelper"
import { CodeMapNode } from "../../../../codeCharta.model"

export interface PathToNodeSubscriber {
	onPathToNodeChanged(pathToNode: Map<string, CodeMapNode>)
}

export class PathToNodeService implements StoreSubscriber {
	private static PATH_TO_NODE_CHANGED_EVENT = "path-to-node-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, PathToNodeActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().lookUp.pathToNode
	}

	private notify(newState: Map<string, CodeMapNode>) {
		this.$rootScope.$broadcast(PathToNodeService.PATH_TO_NODE_CHANGED_EVENT, { pathToNode: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: PathToNodeSubscriber) {
		$rootScope.$on(PathToNodeService.PATH_TO_NODE_CHANGED_EVENT, (event, data) => {
			subscriber.onPathToNodeChanged(data.pathToNode)
		})
	}
}
