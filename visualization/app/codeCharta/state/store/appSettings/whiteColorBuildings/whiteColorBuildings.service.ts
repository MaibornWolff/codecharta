import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { WhiteColorBuildingsActions } from "./whiteColorBuildings.actions"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface WhiteColorBuildingsSubscriber {
	onWhiteColorBuildingsChanged(whiteColorBuildings: boolean)
}

export class WhiteColorBuildingsService implements StoreSubscriber {
	private static WHITE_COLOR_BUILDINGS_CHANGED_EVENT = "white-color-buildings-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, WhiteColorBuildingsActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.whiteColorBuildings
	}

	private notify(newState: boolean) {
		this.$rootScope.$broadcast(WhiteColorBuildingsService.WHITE_COLOR_BUILDINGS_CHANGED_EVENT, {
			whiteColorBuildings: newState
		})
	}

	static subscribe($rootScope: IRootScopeService, subscriber: WhiteColorBuildingsSubscriber) {
		$rootScope.$on(WhiteColorBuildingsService.WHITE_COLOR_BUILDINGS_CHANGED_EVENT, (_event_, data) => {
			subscriber.onWhiteColorBuildingsChanged(data.whiteColorBuildings)
		})
	}
}
