"use strict"
import { ThreeCameraService } from "./threeCameraService"
import { IRootScopeService, IAngularEvent } from "angular"
import { OrbitControls, PerspectiveCamera, Vector3 } from "three"
import * as THREE from "three"
import { ThreeSceneService } from "./threeSceneService"

export interface CameraChangeSubscriber {
	onCameraChanged(camera: PerspectiveCamera)
}

export class ThreeOrbitControlsService {
	public static CAMERA_CHANGED_EVENT_NAME = "camera-changed"

	public controls: OrbitControls
	public defaultCameraPosition: Vector3 = new Vector3(0, 0, 0)

	/* ngInject */
	constructor(
		private threeCameraService: ThreeCameraService,
		private threeSceneService: ThreeSceneService,
		private $rootScope: IRootScopeService
	) {}

	public rotateCameraInVectorDirection(x: number, y: number, z: number) {
		const zoom = this.getZoom()
		this.lookAtDirectionFromTarget(x, y, z)
		this.applyOldZoom(zoom)
	}

	private lookAtDirectionFromTarget(x: number, y: number, z: number) {
		this.threeCameraService.camera.position.set(this.controls.target.x, this.controls.target.y, this.controls.target.z)

		const alignmentCube = new THREE.Mesh(new THREE.CubeGeometry(20, 20, 20), new THREE.MeshNormalMaterial())

		this.threeSceneService.scene.add(alignmentCube)

		alignmentCube.position.set(this.controls.target.x, this.controls.target.y, this.controls.target.z)

		alignmentCube.translateX(x)
		alignmentCube.translateY(y)
		alignmentCube.translateZ(z)

		this.threeCameraService.camera.lookAt(alignmentCube.getWorldPosition())
		this.threeSceneService.scene.remove(alignmentCube)
	}

	private getZoom() {
		return this.threeCameraService.camera.position.distanceTo(this.controls.target)
	}

	private applyOldZoom(oldZoom: number) {
		this.threeCameraService.camera.translateZ(oldZoom)
	}

	public autoFitTo(obj = this.threeSceneService.mapGeometry) {
		const boundingSphere = new THREE.Box3().setFromObject(obj).getBoundingSphere()

		const cameraReference = this.threeCameraService.camera

		const scale = 1.4 // object size / display size
		const objectAngularSize = ((cameraReference.fov * Math.PI) / 180) * scale
		const distanceToCamera = boundingSphere.radius / Math.tan(objectAngularSize / 2)
		const len = Math.sqrt(Math.pow(distanceToCamera, 2) + Math.pow(distanceToCamera, 2))

		cameraReference.position.set(len, len, len)
		this.controls.update()

		const t: Vector3 = boundingSphere.center.clone()
		t.setY(0)
		this.controls.target.set(t.x, t.y, t.z)

		cameraReference.lookAt(t)

		this.defaultCameraPosition = cameraReference.clone().position

		this.threeCameraService.camera.updateProjectionMatrix()
	}

	public init(domElement) {
		const OrbitControls = require("three-orbit-controls")(require("three"))
		this.controls = new OrbitControls(this.threeCameraService.camera, domElement)
		this.controls.addEventListener("change", () => {
			this.onInput(this.threeCameraService.camera)
		})
	}

	public onInput(camera: PerspectiveCamera) {
		this.$rootScope.$broadcast(ThreeOrbitControlsService.CAMERA_CHANGED_EVENT_NAME, camera)
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: CameraChangeSubscriber) {
		$rootScope.$on(ThreeOrbitControlsService.CAMERA_CHANGED_EVENT_NAME, (event: IAngularEvent, camera: PerspectiveCamera) => {
			subscriber.onCameraChanged(camera)
		})
	}
}
