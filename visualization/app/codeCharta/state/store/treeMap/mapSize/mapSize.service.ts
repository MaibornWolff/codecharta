import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { MapSizeActions } from "./mapSize.actions"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface MapSizeSubscriber {
	onMapSizeChanged(mapSize: number)
}

export class MapSizeService implements StoreSubscriber {
	private static MAP_SIZE_CHANGED_EVENT = "map-size-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, MapSizeActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().treeMap.mapSize
	}

	private notify(newState: number) {
		this.$rootScope.$broadcast(MapSizeService.MAP_SIZE_CHANGED_EVENT, { mapSize: newState })
	}

	static subscribe($rootScope: IRootScopeService, subscriber: MapSizeSubscriber) {
		$rootScope.$on(MapSizeService.MAP_SIZE_CHANGED_EVENT, (_event_, data) => {
			subscriber.onMapSizeChanged(data.mapSize)
		})
	}
}
