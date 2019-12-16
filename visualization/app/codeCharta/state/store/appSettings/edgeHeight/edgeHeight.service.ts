import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { EdgeHeightActions } from "./edgeHeight.actions"
import _ from "lodash"

export interface EdgeHeightSubscriber {
	onEdgeHeightChanged(edgeHeight: number)
}

export class EdgeHeightService implements StoreSubscriber {
	private static EDGE_HEIGHT_CHANGED_EVENT = "edge-height-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe($rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(EdgeHeightActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.edgeHeight
	}

	private notify(newState: number) {
		this.$rootScope.$broadcast(EdgeHeightService.EDGE_HEIGHT_CHANGED_EVENT, { edgeHeight: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: EdgeHeightSubscriber) {
		$rootScope.$on(EdgeHeightService.EDGE_HEIGHT_CHANGED_EVENT, (event, data) => {
			subscriber.onEdgeHeightChanged(data.edgeHeight)
		})
	}
}
