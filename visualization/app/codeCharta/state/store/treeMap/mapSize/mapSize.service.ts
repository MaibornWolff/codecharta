import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { MapSizeActions } from "./mapSize.actions"
import _ from "lodash"

export interface MapSizeSubscriber {
	onMapSizeChanged(mapSize: number)
}

export class MapSizeService implements StoreSubscriber {
	private static MAP_SIZE_CHANGED_EVENT = "map-size-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe($rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(MapSizeActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().treeMap.mapSize
	}

	private notify(newState: number) {
		this.$rootScope.$broadcast(MapSizeService.MAP_SIZE_CHANGED_EVENT, { mapSize: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: MapSizeSubscriber) {
		$rootScope.$on(MapSizeService.MAP_SIZE_CHANGED_EVENT, (event, data) => {
			subscriber.onMapSizeChanged(data.mapSize)
		})
	}
}
