import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { isActionOfType } from "../../../../util/reduxHelper"
import { TrackingDataEnabledActions } from "./trackingDataEnabled.actions"

export interface TrackingDataEnabledSubscriber {
	onTrackingDataEnabledChanged(trackingDataEnabled: boolean)
}

export class TrackingDataEnabledService implements StoreSubscriber {
	private static TRACKING_DATA_ENABLED_CHANGED_EVENT = "tracking-data-enabled-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, TrackingDataEnabledActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.trackingDataEnabled
	}

	private notify(newState: boolean) {
		this.$rootScope.$broadcast(TrackingDataEnabledService.TRACKING_DATA_ENABLED_CHANGED_EVENT, {
			trackingDataEnabled: newState
		})
	}

	static subscribe($rootScope: IRootScopeService, subscriber: TrackingDataEnabledSubscriber) {
		$rootScope.$on(TrackingDataEnabledService.TRACKING_DATA_ENABLED_CHANGED_EVENT, (_event_, data) => {
			subscriber.onTrackingDataEnabledChanged(data.trackingDataEnabled)
		})
	}
}
