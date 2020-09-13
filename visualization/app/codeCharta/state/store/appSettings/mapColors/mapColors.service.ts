import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { MapColorsActions } from "./mapColors.actions"
import { MapColors } from "../../../../codeCharta.model"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface MapColorsSubscriber {
	onMapColorsChanged(mapColors: MapColors)
}

export class MapColorsService implements StoreSubscriber {
	private static MAP_COLORS_CHANGED_EVENT = "map-colors-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, MapColorsActions)) {
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
		$rootScope.$on(MapColorsService.MAP_COLORS_CHANGED_EVENT, (_event_, data) => {
			subscriber.onMapColorsChanged(data.mapColors)
		})
	}
}
