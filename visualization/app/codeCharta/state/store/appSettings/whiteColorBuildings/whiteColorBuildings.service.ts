import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { WhiteColorBuildingsActions } from "./whiteColorBuildings.actions"
import _ from "lodash"

export interface WhiteColorBuildingsSubscriber {
	onWhiteColorBuildingsChanged(whiteColorBuildings: boolean)
}

export class WhiteColorBuildingsService implements StoreSubscriber {
	private static WHITE_COLOR_BUILDINGS_CHANGED_EVENT = "white-color-buildings-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe($rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(WhiteColorBuildingsActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.whiteColorBuildings
	}

	private notify(newState: boolean) {
		this.$rootScope.$broadcast(WhiteColorBuildingsService.WHITE_COLOR_BUILDINGS_CHANGED_EVENT, { whiteColorBuildings: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: WhiteColorBuildingsSubscriber) {
		$rootScope.$on(WhiteColorBuildingsService.WHITE_COLOR_BUILDINGS_CHANGED_EVENT, (event, data) => {
			subscriber.onWhiteColorBuildingsChanged(data.whiteColorBuildings)
		})
	}
}
