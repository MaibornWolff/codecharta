import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { FocusedNodePathActions } from "./focusedNodePath.actions"
import _ from "lodash"

export interface FocusedNodePathSubscriber {
	onFocusedNodePathChanged(focusedNodePath: string)
}

export class FocusedNodePathService implements StoreSubscriber {
	private static FOCUSED_NODE_PATH_CHANGED_EVENT = "focused-node-path-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe($rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(FocusedNodePathActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().dynamicSettings.focusedNodePath
	}

	private notify(newState: string) {
		this.$rootScope.$broadcast(FocusedNodePathService.FOCUSED_NODE_PATH_CHANGED_EVENT, { focusedNodePath: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: FocusedNodePathSubscriber) {
		$rootScope.$on(FocusedNodePathService.FOCUSED_NODE_PATH_CHANGED_EVENT, (event, data) => {
			subscriber.onFocusedNodePathChanged(data.focusedNodePath)
		})
	}
}
