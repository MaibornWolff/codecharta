import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { CameraActions } from "./camera.actions"
import { Vector3 } from "three"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface CameraSubscriber {
	onStoreCameraChanged(camera: Vector3)
}

export class CameraService implements StoreSubscriber {
	private static CAMERA_CHANGED_EVENT = "store-camera-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, CameraActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.camera
	}

	private notify(newState: Vector3) {
		//TODO: Move camera out of the state and persist it in a service
		this.$rootScope.$broadcast(CameraService.CAMERA_CHANGED_EVENT, { camera: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: CameraSubscriber) {
		$rootScope.$on(CameraService.CAMERA_CHANGED_EVENT, (event, data) => {
			subscriber.onStoreCameraChanged(data.camera)
		})
	}
}
