import { Vector3 } from "three"
import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { CameraTargetActions } from "./cameraTarget.actions"
import _ from "lodash"

export interface CameraTargetSubscriber {
	onStoreCameraTargetChanged(cameraTarget: Vector3)
}

export class CameraTargetService implements StoreSubscriber {
	private static CAMERA_TARGET_CHANGED_EVENT = "camera-target-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(CameraTargetActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.cameraTarget
	}

	private notify(newState: Vector3) {
		this.$rootScope.$broadcast(CameraTargetService.CAMERA_TARGET_CHANGED_EVENT, { cameraTarget: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: CameraTargetSubscriber) {
		$rootScope.$on(CameraTargetService.CAMERA_TARGET_CHANGED_EVENT, (event, data) => {
			subscriber.onStoreCameraTargetChanged(data.cameraTarget)
		})
	}
}
