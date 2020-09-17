import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { EdgeHeightActions } from "./edgeHeight.actions"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface EdgeHeightSubscriber {
	onEdgeHeightChanged(edgeHeight: number)
}

export class EdgeHeightService implements StoreSubscriber {
	private static EDGE_HEIGHT_CHANGED_EVENT = "edge-height-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, EdgeHeightActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.edgeHeight
	}

	private notify(newState: number) {
		this.$rootScope.$broadcast(EdgeHeightService.EDGE_HEIGHT_CHANGED_EVENT, { edgeHeight: newState })
	}

	static subscribe($rootScope: IRootScopeService, subscriber: EdgeHeightSubscriber) {
		$rootScope.$on(EdgeHeightService.EDGE_HEIGHT_CHANGED_EVENT, (_event_, data) => {
			subscriber.onEdgeHeightChanged(data.edgeHeight)
		})
	}
}
