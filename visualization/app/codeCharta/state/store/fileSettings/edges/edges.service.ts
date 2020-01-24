import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { EdgesActions } from "./edges.actions"
import _ from "lodash"
import { Edge } from "../../../../model/codeCharta.model"

export interface EdgesSubscriber {
	onEdgesChanged(edges: Edge[])
}

export class EdgesService implements StoreSubscriber {
	private static EDGES_CHANGED_EVENT = "edges-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe($rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(EdgesActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().fileSettings.edges
	}

	private notify(newState: Edge[]) {
		this.$rootScope.$broadcast(EdgesService.EDGES_CHANGED_EVENT, { edges: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: EdgesSubscriber) {
		$rootScope.$on(EdgesService.EDGES_CHANGED_EVENT, (event, data) => {
			subscriber.onEdgesChanged(data.edges)
		})
	}
}
