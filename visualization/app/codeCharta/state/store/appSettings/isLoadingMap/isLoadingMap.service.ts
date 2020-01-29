import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { IsLoadingMapActions } from "./isLoadingMap.actions"
import _ from "lodash"

export interface IsLoadingMapSubscriber {
	onIsLoadingMapChanged(isLoadingMap: boolean)
}

export class IsLoadingMapService implements StoreSubscriber {
	private static IS_LOADING_MAP_CHANGED_EVENT = "is-loading-map-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(IsLoadingMapActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.isLoadingMap
	}

	private notify(newState: boolean) {
		this.$rootScope.$broadcast(IsLoadingMapService.IS_LOADING_MAP_CHANGED_EVENT, { isLoadingMap: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: IsLoadingMapSubscriber) {
		$rootScope.$on(IsLoadingMapService.IS_LOADING_MAP_CHANGED_EVENT, (event, data) => {
			subscriber.onIsLoadingMapChanged(data.isLoadingMap)
		})
	}
}
