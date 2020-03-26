import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { HideFlatBuildingsActions } from "./hideFlatBuildings.actions"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface HideFlatBuildingsSubscriber {
	onHideFlatBuildingsChanged(hideFlatBuildings: boolean)
}

export class HideFlatBuildingsService implements StoreSubscriber {
	private static HIDE_FLAT_BUILDINGS_CHANGED_EVENT = "hide-flat-buildings-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, HideFlatBuildingsActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.hideFlatBuildings
	}

	private notify(newState: boolean) {
		this.$rootScope.$broadcast(HideFlatBuildingsService.HIDE_FLAT_BUILDINGS_CHANGED_EVENT, { hideFlatBuildings: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: HideFlatBuildingsSubscriber) {
		$rootScope.$on(HideFlatBuildingsService.HIDE_FLAT_BUILDINGS_CHANGED_EVENT, (event, data) => {
			subscriber.onHideFlatBuildingsChanged(data.hideFlatBuildings)
		})
	}
}
