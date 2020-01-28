import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { MapColorsActions } from "./mapColors.actions"
import _ from "lodash"
import { MapColors } from "../../../../codeCharta.model"

export interface MapColorsSubscriber {
	onMapColorsChanged(mapColors: MapColors)
}

export class MapColorsService implements StoreSubscriber {
	private static MAP_COLORS_CHANGED_EVENT = "map-colors-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(MapColorsActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.mapColors
	}

	private notify(newState: MapColors) {
		this.$rootScope.$broadcast(MapColorsService.MAP_COLORS_CHANGED_EVENT, { mapColors: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: MapColorsSubscriber) {
		$rootScope.$on(MapColorsService.MAP_COLORS_CHANGED_EVENT, (event, data) => {
			subscriber.onMapColorsChanged(data.mapColors)
		})
	}
}
