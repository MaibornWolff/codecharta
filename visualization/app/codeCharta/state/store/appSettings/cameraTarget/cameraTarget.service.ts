import { Vector3 } from "three"
import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { CameraTargetActions } from "./cameraTarget.actions"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface CameraTargetSubscriber {
	onStoreCameraTargetChanged(cameraTarget: Vector3)
}

export class CameraTargetService implements StoreSubscriber {
	private static CAMERA_TARGET_CHANGED_EVENT = "camera-target-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, CameraTargetActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.cameraTarget
	}

	private notify(newState: Vector3) {
		this.$rootScope.$broadcast(CameraTargetService.CAMERA_TARGET_CHANGED_EVENT, { cameraTarget: newState })
	}

	static subscribe($rootScope: IRootScopeService, subscriber: CameraTargetSubscriber) {
		$rootScope.$on(CameraTargetService.CAMERA_TARGET_CHANGED_EVENT, (_event_, data) => {
			subscriber.onStoreCameraTargetChanged(data.cameraTarget)
		})
	}
}
