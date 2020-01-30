import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { ScalingActions } from "./scaling.actions"
import _ from "lodash"
import { Vector3 } from "three"

export interface ScalingSubscriber {
	onScalingChanged(scaling: Vector3)
}

export class ScalingService implements StoreSubscriber {
	private static SCALING_CHANGED_EVENT = "scaling-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(ScalingActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.scaling
	}

	private notify(newState: Vector3) {
		this.$rootScope.$broadcast(ScalingService.SCALING_CHANGED_EVENT, { scaling: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: ScalingSubscriber) {
		$rootScope.$on(ScalingService.SCALING_CHANGED_EVENT, (event, data) => {
			subscriber.onScalingChanged(data.scaling)
		})
	}
}
