import { ThreeCameraService } from "./threeCameraService"
import { IRootScopeService, IAngularEvent } from "angular"
import { Box3, CubeGeometry, Mesh, MeshNormalMaterial, OrbitControls, PerspectiveCamera, Vector3 } from "three"
import { ThreeSceneService } from "./threeSceneService"
import { SettingsService } from "../../../state/settingsService/settings.service"
import { FocusNodeSubscriber, UnfocusNodeSubscriber } from "../../../state/settingsService/settings.service.events"
import { LoadingStatusService } from "../../../state/loadingStatus.service"
import { StoreService } from "../../../state/store.service"

export interface CameraChangeSubscriber {
	onCameraChanged(camera: PerspectiveCamera)
}

export class ThreeOrbitControlsService implements FocusNodeSubscriber, UnfocusNodeSubscriber {
	public static CAMERA_CHANGED_EVENT_NAME = "camera-changed"

	public controls: OrbitControls
	public defaultCameraPosition: Vector3 = new Vector3(0, 0, 0)

	/* ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private threeCameraService: ThreeCameraService,
		private threeSceneService: ThreeSceneService,
		private loadingStatusService: LoadingStatusService
	) {
		SettingsService.subscribeToFocusNode($rootScope, this)
		SettingsService.subscribeToUnfocusNode($rootScope, this)
	}

	public onFocusNode(focusPath: string) {
		this.autoFitTo()
	}

	public onUnfocusNode() {
		if (!this.loadingStatusService.isLoadingNewFile() && !this.loadingStatusService.isLoadingNewMap()) {
			this.autoFitTo()
		}
	}

	public rotateCameraInVectorDirection(x: number, y: number, z: number) {
		const zoom = this.getZoom()
		this.lookAtDirectionFromTarget(x, y, z)
		this.applyOldZoom(zoom)
	}

	public cameraActionWhenNewMapIsLoaded() {
		if (this.storeService.getState().appSettings.resetCameraIfNewFileIsLoaded) {
			this.autoFitTo()
		}
	}

	public autoFitTo() {
		const boundingSphere = this.getBoundingSphere()

		const len: number = this.cameraPerspectiveLengthCalculation(boundingSphere)
		const cameraReference = this.threeCameraService.camera

		cameraReference.position.set(boundingSphere.center.x + len, len, boundingSphere.center.z + len)
		this.defaultCameraPosition = cameraReference.position.clone()
		this.controls.update()

		this.focusCameraViewToCenter(boundingSphere)
	}

	private cameraPerspectiveLengthCalculation(boundingSphere) {
		const cameraReference = this.threeCameraService.camera

		const scale = 1.4 // object size / display size
		const objectAngularSize = ((cameraReference.fov * Math.PI) / 180) * scale
		const distanceToCamera = boundingSphere.radius / Math.tan(objectAngularSize / 2)
		const len = Math.sqrt(Math.pow(distanceToCamera, 2) + Math.pow(distanceToCamera, 2))

		return len
	}

	private focusCameraViewToCenter(boundingSphere) {
		const boundingSphereCenter: Vector3 = boundingSphere.center.clone()

		boundingSphereCenter.setY(0)

		this.controls.target.set(boundingSphereCenter.x, boundingSphereCenter.y, boundingSphereCenter.z)

		this.threeCameraService.camera.lookAt(boundingSphereCenter)

		this.threeCameraService.camera.updateProjectionMatrix()
	}

	private getBoundingSphere() {
		return new Box3().setFromObject(this.threeSceneService.mapGeometry).getBoundingSphere()
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
