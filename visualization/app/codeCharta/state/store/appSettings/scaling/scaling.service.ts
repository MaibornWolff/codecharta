import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { ScalingActions } from "./scaling.actions"
import { Vector3 } from "three"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface ScalingSubscriber {
	onScalingChanged(scaling: Vector3)
}

export class ScalingService implements StoreSubscriber {
	private static SCALING_CHANGED_EVENT = "scaling-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, ScalingActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.scaling
	}

	private notify(newState: Vector3) {
		this.$rootScope.$broadcast(ScalingService.SCALING_CHANGED_EVENT, { scaling: newState })
	}

	static subscribe($rootScope: IRootScopeService, subscriber: ScalingSubscriber) {
		$rootScope.$on(ScalingService.SCALING_CHANGED_EVENT, (_event_, data) => {
			subscriber.onScalingChanged(data.scaling)
		})
	}
}
