"use strict"

import * as THREE from "three"
import { SettingsService } from "../../../state/settingsService/settings.service"
import { PerspectiveCamera, Vector3 } from "three"
import { IRootScopeService } from "angular"
import { RecursivePartial, Settings } from "../../../codeCharta.model"
import _ from "lodash"
import { CameraChangeSubscriber, ThreeOrbitControlsService } from "./threeOrbitControlsService"
import { SettingsServiceSubscriber } from "../../../state/settingsService/settings.service.events"
import { StoreService } from "../../../state/store.service"
import { setCamera } from "../../../state/store/appSettings/camera/camera.actions"

export class ThreeCameraService implements SettingsServiceSubscriber, CameraChangeSubscriber {
	public static VIEW_ANGLE = 45
	public static NEAR = 100
	public static FAR = 200000 //TODO optimize renderer for far objects
	private static DEBOUNCE_TIME = 400
	private readonly throttledCameraChange: () => void

	public camera: PerspectiveCamera
	private lastCameraVector: Vector3 = new Vector3(0, 0, 0)

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService, private settingsService: SettingsService) {
		this.throttledCameraChange = _.throttle(() => {
			this.settingsService.updateSettings(
				{ appSettings: { camera: new Vector3(this.camera.position.x, this.camera.position.y, this.camera.position.z) } },
				true
			)

			this.storeService.dispatch(setCamera(this.camera.position), true)
		}, ThreeCameraService.DEBOUNCE_TIME)
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>) {
		if (JSON.stringify(settings.appSettings.camera) !== JSON.stringify(this.lastCameraVector)) {
			this.lastCameraVector = settings.appSettings.camera
			this.setPosition(this.lastCameraVector.x, this.lastCameraVector.y, this.lastCameraVector.z)
		}
	}

	public onCameraChanged(camera: PerspectiveCamera) {
		this.throttledCameraChange()
	}

	public init(containerWidth: number, containerHeight: number, x: number, y: number, z: number) {
		const aspect = containerWidth / containerHeight
		this.camera = new THREE.PerspectiveCamera(ThreeCameraService.VIEW_ANGLE, aspect, ThreeCameraService.NEAR, ThreeCameraService.FAR)
		this.setPosition(x, y, z)
		SettingsService.subscribe(this.$rootScope, this)
		ThreeOrbitControlsService.subscribe(this.$rootScope, this)
	}

	public setPosition(x: number, y: number, z: number) {
		this.camera.position.set(x, y, z)
	}
}
