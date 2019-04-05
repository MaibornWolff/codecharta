"use strict"

import * as THREE from "three"
import { SettingsServiceSubscriber, SettingsService } from "../../../state/settings.service"
import { PerspectiveCamera, Vector3 } from "three"
import { IAngularEvent, IRootScopeService } from "angular"
import {Settings} from "../../../codeCharta.model"

class ThreeCameraService implements SettingsServiceSubscriber {
	public static SELECTOR = "threeCameraService"

	public static VIEW_ANGLE = 45
	public static NEAR = 100
	public static FAR = 200000 //TODO optimize renderer for far objects

	public camera: PerspectiveCamera
	private lastCameraVector: Vector3 = new Vector3(0,0 ,0)

	constructor(private $rootScope: IRootScopeService) {}

	public onSettingsChanged(settings: Settings, event: IAngularEvent) {
		if (JSON.stringify(settings.appSettings.camera) !== JSON.stringify(this.lastCameraVector)) {
			this.lastCameraVector = settings.appSettings.camera
			this.setPosition(this.lastCameraVector.x, this.lastCameraVector.y, this.lastCameraVector.z)
		}
	}

	public init(containerWidth: number, containerHeight: number, x: number, y: number, z: number) {
		const aspect = containerWidth / containerHeight
		this.camera = new THREE.PerspectiveCamera(ThreeCameraService.VIEW_ANGLE, aspect, ThreeCameraService.NEAR, ThreeCameraService.FAR)
		this.setPosition(x, y, z)
		SettingsService.subscribe(this.$rootScope, this)
	}

	public setPosition(x: number, y: number, z: number) {
		this.camera.position.set(x, y, z)
	}
}

export { ThreeCameraService }
