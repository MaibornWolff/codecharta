import { ThreeCameraService } from "./threeCameraService"
import { IRootScopeService, ITimeoutService } from "angular"
import { Box3, Mesh, MeshNormalMaterial, PerspectiveCamera, Vector3, Sphere, BoxGeometry } from "three"
import { ThreeSceneService } from "./threeSceneService"
import { LayoutAlgorithmSubscriber, LayoutAlgorithmService } from "../../../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.service"
import {
	FocusedNodePathService,
	FocusNodeSubscriber,
	UnfocusNodeSubscriber
} from "../../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.service"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
// TODO remove this old orbital control and use the jsm examples oneW
// eslint-disable-next-line no-duplicate-imports
import * as Three from "three"
import oc from "three-orbit-controls"
import { ThreeUpdateCycleService } from "./threeUpdateCycleService"
import { EventEmitter } from "tsee"

type CameraChangeEvents = {
	onCameraChanged: (data: { camera: PerspectiveCamera }) => void
}

export class ThreeOrbitControlsService implements FocusNodeSubscriber, UnfocusNodeSubscriber, LayoutAlgorithmSubscriber {
	static CAMERA_CHANGED_EVENT_NAME = "camera-changed"
	static instance: ThreeOrbitControlsService

	controls: OrbitControls
	defaultCameraPosition: Vector3 = new Vector3(0, 0, 0)
	private eventEmitter = new EventEmitter<CameraChangeEvents>()

	constructor(
		private $rootScope: IRootScopeService,
		private $timeout: ITimeoutService,
		private threeCameraService: ThreeCameraService,
		private threeSceneService: ThreeSceneService,
		private threeUpdateCycleService: ThreeUpdateCycleService
	) {
		"ngInject"
		ThreeOrbitControlsService.instance = this
		FocusedNodePathService.subscribeToFocusNode(this.$rootScope, this)
		FocusedNodePathService.subscribeToUnfocusNode(this.$rootScope, this)
		LayoutAlgorithmService.subscribe(this.$rootScope, this)
	}

	onFocusNode() {
		this.autoFitTo()
	}

	onUnfocusNode() {
		this.autoFitTo()
	}

	onLayoutAlgorithmChanged() {
		this.autoFitTo()
	}

	// TODO add autofit for SharpnessMode ?

	setControlTarget(cameraTarget: Vector3) {
		this.controls.target.set(cameraTarget.x, cameraTarget.y, cameraTarget.z)
	}

	rotateCameraInVectorDirection(x: number, y: number, z: number) {
		const zoom = this.getZoom()
		this.lookAtDirectionFromTarget(x, y, z)
		this.applyOldZoom(zoom)

		this.update()
		this.onInput(this.threeCameraService.camera)
	}

	autoFitTo() {
		this.$timeout(() => {
			const boundingSphere = this.getBoundingSphere()

			const length = this.cameraPerspectiveLengthCalculation(boundingSphere)
			const cameraReference = this.threeCameraService.camera

			cameraReference.position.set(length, length, boundingSphere.center.z)

			this.defaultCameraPosition = cameraReference.position.clone()
			this.controls.update()

			this.focusCameraViewToCenter(boundingSphere)
			this.threeUpdateCycleService.update()
			this.onInput(this.threeCameraService.camera)
		})
	}

	update() {
		this.threeUpdateCycleService.update()
	}

	private cameraPerspectiveLengthCalculation(boundingSphere: Sphere) {
		const cameraReference = this.threeCameraService.camera

		//TODO: Scale Factor for object to camera ratio
		const scale = 1.3 // object size / display size
		const objectAngularSize = ((cameraReference.fov * Math.PI) / 180) * scale

		const distanceToCamera = boundingSphere.radius / Math.tan(objectAngularSize / 2)
		return Math.sqrt(Math.pow(distanceToCamera, 2) + Math.pow(distanceToCamera, 2))
	}

	private focusCameraViewToCenter(boundingSphere: Sphere) {
		const boundingSphereCenter: Vector3 = boundingSphere.center.clone()

		boundingSphereCenter.setY(0)

		this.controls.target.set(boundingSphereCenter.x, boundingSphereCenter.y, boundingSphereCenter.z)

		this.threeCameraService.camera.lookAt(boundingSphereCenter)

		this.threeCameraService.camera.updateProjectionMatrix()
	}

	private getBoundingSphere() {
		return new Box3().setFromObject(this.threeSceneService.mapGeometry).getBoundingSphere(new Sphere())
	}

	private lookAtDirectionFromTarget(x: number, y: number, z: number) {
		this.threeCameraService.camera.position.set(this.controls.target.x, this.controls.target.y, this.controls.target.z)

		const alignmentCube = new Mesh(new BoxGeometry(20, 20, 20), new MeshNormalMaterial())

		this.threeSceneService.scene.add(alignmentCube)

		alignmentCube.position.set(this.controls.target.x, this.controls.target.y, this.controls.target.z)

		alignmentCube.translateX(x)
		alignmentCube.translateY(y)
		alignmentCube.translateZ(z)

		this.threeCameraService.camera.lookAt(alignmentCube.getWorldPosition(alignmentCube.position))
		this.threeSceneService.scene.remove(alignmentCube)
	}

	private getZoom() {
		return this.threeCameraService.camera.position.distanceTo(this.controls.target)
	}

	private applyOldZoom(oldZoom: number) {
		this.threeCameraService.camera.translateZ(oldZoom)
	}

	init(domElement: HTMLCanvasElement) {
		const orbitControls = oc(Three)
		this.controls = new orbitControls(this.threeCameraService.camera, domElement)
		this.controls.addEventListener("change", () => {
			this.onInput(this.threeCameraService.camera)
		})
	}

	onInput(camera: PerspectiveCamera) {
		this.setControlTarget(this.controls.target)
		this.eventEmitter.emit("onCameraChanged", { camera })
	}

	subscribe<Key extends keyof CameraChangeEvents>(key: Key, callback: CameraChangeEvents[Key]) {
		this.eventEmitter.on(key, data => {
			callback(data)
		})
	}
}
