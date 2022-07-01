"use strict"

import { PerspectiveCamera, Vector3 } from "three"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../state/store.service"
import { CameraService, CameraSubscriber } from "../../../state/store/appSettings/camera/camera.service"

export class ThreeCameraService implements CameraSubscriber {
	static VIEW_ANGLE = 45
	static NEAR = 50
	static FAR = 200_000 //TODO optimize renderer for far objects
	camera: PerspectiveCamera

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		CameraService.subscribe(this.$rootScope, this)
	}

	onStoreCameraChanged(camera: Vector3) {
		this.camera.position.set(camera.x, camera.y, camera.z)
		this.camera.lookAt(0, 0, 0)
	}

	init(containerWidth: number, containerHeight: number) {
		const aspect = containerWidth / containerHeight
		this.camera = new PerspectiveCamera(ThreeCameraService.VIEW_ANGLE, aspect, ThreeCameraService.NEAR, ThreeCameraService.FAR)
		this.setPosition()
	}

	setPosition() {
		const { camera } = this.storeService.getState().appSettings
		this.camera.position.set(camera.x, camera.y, camera.z)
	}
}
