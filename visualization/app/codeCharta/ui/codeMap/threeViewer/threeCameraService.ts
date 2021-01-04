"use strict"

import { PerspectiveCamera, Vector3 } from "three"
import { IRootScopeService } from "angular"
import throttle from "lodash.throttle"
import { CameraChangeSubscriber, ThreeOrbitControlsService } from "./threeOrbitControlsService"
import { StoreService } from "../../../state/store.service"
import { setCamera } from "../../../state/store/appSettings/camera/camera.actions"
import { CameraService, CameraSubscriber } from "../../../state/store/appSettings/camera/camera.service"

export class ThreeCameraService implements CameraChangeSubscriber, CameraSubscriber {
	static VIEW_ANGLE = 45
	static NEAR = 1 // !NOTE decreased in order to disable clipping for street layout, can be reverted after rescaling and repositioning the layout
	static FAR = 200000 //TODO optimize renderer for far objects
	private static DEBOUNCE_TIME = 400
	private readonly throttledCameraChange: () => void

	camera: PerspectiveCamera

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		this.throttledCameraChange = throttle(() => {
			this.storeService.dispatch(setCamera(this.camera.position), { silent: true })
		}, ThreeCameraService.DEBOUNCE_TIME)
		CameraService.subscribe(this.$rootScope, this)
	}

	onStoreCameraChanged(camera: Vector3) {
		this.camera.position.set(camera.x, camera.y, camera.z)
		this.camera.lookAt(0, 0, 0)
	}

	onCameraChanged() {
		this.throttledCameraChange()
	}

	init(containerWidth: number, containerHeight: number) {
		const aspect = containerWidth / containerHeight
		this.camera = new PerspectiveCamera(ThreeCameraService.VIEW_ANGLE, aspect, ThreeCameraService.NEAR, ThreeCameraService.FAR)
		this.setPosition()
		ThreeOrbitControlsService.subscribe(this.$rootScope, this)
	}

	setPosition() {
		const { camera } = this.storeService.getState().appSettings
		this.camera.position.set(camera.x, camera.y, camera.z)
	}
}
