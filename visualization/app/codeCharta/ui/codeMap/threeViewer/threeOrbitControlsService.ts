import { ThreeCameraService } from "./threeCameraService"
import { IRootScopeService, IAngularEvent } from "angular"
import { Box3, CubeGeometry, Mesh, MeshNormalMaterial, OrbitControls, PerspectiveCamera, Vector3, Pass } from "three"
import { ThreeSceneService } from "./threeSceneService"
import { SettingsService } from "../../../state/settingsService/settings.service"
import _ from "lodash"
import { FocusedNodePathSubscriber } from "../../../state/settingsService/settings.service.events"
import { LoadingGifService } from "../../loadingGif/loadingGif.service"

export interface CameraChangeSubscriber {
	onCameraChanged(camera: PerspectiveCamera)
}

/**
 * Service to manage the three orbit controls in an angular way.
 */
export class ThreeOrbitControlsService implements FocusedNodePathSubscriber {
	public static CAMERA_CHANGED_EVENT_NAME = "camera-changed"

	public controls: OrbitControls
	public defaultCameraPosition: Vector3 = new Vector3(0, 0, 0)
	public defaultZoom: number = 0

	/* ngInject */
	constructor(
		private threeCameraService: ThreeCameraService,
		private threeSceneService: ThreeSceneService,
		private $rootScope: IRootScopeService,
		private settingsService: SettingsService,
		private loadingGifService: LoadingGifService
	) {
		SettingsService.subscribeToFocusedNode($rootScope, this)
	}

	public onFocusedNodePathChanged(focusedPath: string) {
		if (_.isEmpty(focusedPath) && !this.loadingGifService.isLoadingNewFile()) {
			this.resetCameraPerspective()
		} else if (!_.isEmpty(focusedPath)) {
			this.autoFitTo()
		}
	}

	public rotateCameraInVectorDirection(x: number, y: number, z: number) {
		const zoom = this.getZoom()
		this.lookAtDirectionFromTarget(x, y, z)
		this.applyOldZoom(zoom)
	}

	public setCamera() {
		if (this.settingsService.getSettings().appSettings.resetCameraIfNewFileIsLoaded) {
			this.autoFitTo()
			this.setDefaultZoom()
		} else {
			this.setDefaultZoomWithoutPerspective()
		}
	}

	public setDefaultZoom() {
		this.defaultZoom = this.getZoom()
	}

	public resetCameraPerspective() {
		this.threeCameraService.camera.position
			.sub(this.controls.target)
			.setLength(this.defaultZoom)
			.add(this.controls.target)
	}

	private lookAtDirectionFromTarget(x: number, y: number, z: number) {
		this.threeCameraService.camera.position.set(this.controls.target.x, this.controls.target.y, this.controls.target.z)

		const alignmentCube = new Mesh(new CubeGeometry(20, 20, 20), new MeshNormalMaterial())

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

	private autoFitToCalculation(boundingSphere, cameraReference) {
		const scale = 1.4 // object size / display size
		const objectAngularSize = ((cameraReference.fov * Math.PI) / 180) * scale
		const distanceToCamera = boundingSphere.radius / Math.tan(objectAngularSize / 2)
		const len = Math.sqrt(Math.pow(distanceToCamera, 2) + Math.pow(distanceToCamera, 2))

		return len
	}

	public autoFitTo(obj = this.threeSceneService.mapGeometry) {
		const boundingSphere = new Box3().setFromObject(obj).getBoundingSphere()
		const cameraReference = this.threeCameraService.camera

		const len: number = this.autoFitToCalculation(boundingSphere, cameraReference)

		cameraReference.position.set(len, len, len)
		this.controls.update()

		const t: Vector3 = boundingSphere.center.clone()
		t.setY(0)
		this.controls.target.set(t.x, t.y, t.z)

		cameraReference.lookAt(t)

		this.threeCameraService.camera.updateProjectionMatrix()
	}

	private setDefaultZoomWithoutPerspective() {
		const obj = this.threeSceneService.mapGeometry.clone()
		const boundingSphere = new Box3().setFromObject(obj).getBoundingSphere()

		const cameraReference = this.threeCameraService.camera.clone()

		const len = this.autoFitToCalculation(boundingSphere, cameraReference)

		this.defaultCameraPosition.set(len, len, len)

		const targetfake: Vector3 = new Vector3(0, 0, 0)
		const t: Vector3 = boundingSphere.center
		t.setY(0)
		targetfake.set(t.x, t.y, t.z)

		this.defaultZoom = this.defaultCameraPosition.distanceTo(targetfake)
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
