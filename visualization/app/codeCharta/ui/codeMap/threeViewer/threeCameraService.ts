"use strict"

import { PerspectiveCamera, Vector3 } from "three"

export class ThreeCameraService {
	static VIEW_ANGLE = 45
	static NEAR = 50
	static FAR = 200_000 //TODO optimize renderer for far objects
	camera: PerspectiveCamera

	init(containerWidth: number, containerHeight: number) {
		const aspect = containerWidth / containerHeight
		this.camera = new PerspectiveCamera(ThreeCameraService.VIEW_ANGLE, aspect, ThreeCameraService.NEAR, ThreeCameraService.FAR)
		this.setPosition(new Vector3(0, 300, 1000))
	}

	setPosition(position: Vector3) {
		this.camera.position.set(position.x, position.y, position.z)
		this.camera.lookAt(0, 0, 0)
	}
}
