"use strict"

import { PerspectiveCamera, Vector3 } from "three"
import { IRootScopeService } from "angular"
import _ from "lodash"
import { CameraChangeSubscriber, ThreeOrbitControlsService } from "./threeOrbitControlsService"
import { StoreService } from "../../../state/store.service"
import { setCamera } from "../../../state/store/appSettings/camera/camera.actions"
import { CameraService, CameraSubscriber } from "../../../state/store/appSettings/camera/camera.service"

export class ThreeCameraService implements CameraChangeSubscriber, CameraSubscriber {
	public static VIEW_ANGLE = 45
	public static NEAR = 100
	public static FAR = 200000 //TODO optimize renderer for far objects
	private static DEBOUNCE_TIME = 400
	private readonly throttledCameraChange: () => void

	public camera: PerspectiveCamera

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		this.throttledCameraChange = _.throttle(() => {
			this.storeService.dispatch(setCamera(this.camera.position), { silent: true })
		}, ThreeCameraService.DEBOUNCE_TIME)
		CameraService.subscribe(this.$rootScope, this)
	}

	public onStoreCameraChanged(camera: Vector3) {
		this.camera.position.set(camera.x, camera.y, camera.z)
		this.camera.lookAt(0, 0, 0)
	}

	public onCameraChanged() {
		this.throttledCameraChange()
	}

	public init(containerWidth: number, containerHeight: number) {
		const aspect = containerWidth / containerHeight
		this.camera = new PerspectiveCamera(ThreeCameraService.VIEW_ANGLE, aspect, ThreeCameraService.NEAR, ThreeCameraService.FAR)
		this.setPosition()
		ThreeOrbitControlsService.subscribe(this.$rootScope, this)
	}

	public setPosition() {
		const { camera } = this.storeService.getState().appSettings
		this.camera.position.set(camera.x, camera.y, camera.z)
	}
}
