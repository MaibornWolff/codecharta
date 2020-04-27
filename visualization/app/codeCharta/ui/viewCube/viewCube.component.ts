import "./viewCube.component.scss"
import * as THREE from "three"
import { PerspectiveCamera } from "three"
import { IRootScopeService } from "angular"
import { ViewCubemeshGenerator } from "./viewCube.meshGenerator"
import { CameraChangeSubscriber, ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { ViewCubeEventSubscriber, ViewCubeMouseEventsService } from "./viewCube.mouseEvents.service"

export class ViewCubeController implements CameraChangeSubscriber, ViewCubeEventSubscriber {
	private lights: THREE.Group
	private cubeGroup: THREE.Group
	private camera: THREE.PerspectiveCamera
	private renderer: THREE.WebGLRenderer
	private scene: THREE.Scene
	private WIDTH = 200
	private HEIGHT = 200
	private LENGTH_VIEWCUBE = 1

	private hoverInfo = { cube: null, originalMaterial: null }

	private cubeDefinition = {
		front: null,
		middle: null,
		back: null
	}

	/* @ngInject */
	constructor(
		private $element,
		private $rootScope: IRootScopeService,
		private threeOrbitControlsService: ThreeOrbitControlsService,
		private viewCubeMouseEventsService: ViewCubeMouseEventsService
	) {
		this.initScene()
		this.initLights()
		this.initRenderer(this.$element)
		this.initCube()
		this.initAxesHelper()
		this.initCamera()
		this.startAnimation()
		this.viewCubeMouseEventsService.init(this.cubeGroup, this.camera, this.renderer)

		ThreeOrbitControlsService.subscribe(this.$rootScope, this)
		ViewCubeMouseEventsService.subscribeToViewCubeMouseEvents(this.$rootScope, this)
	}

	private initAxesHelper() {
		const axesHelper = new THREE.AxesHelper(1.3)
		const centerOffset = -(this.LENGTH_VIEWCUBE / 2) + 0.01
		axesHelper.position.x += centerOffset
		axesHelper.position.y += centerOffset
		axesHelper.position.z += centerOffset

		this.scene.add(axesHelper)
	}

	private initCube() {
		const { group, front, middle, back } = ViewCubemeshGenerator.buildCube(1.6)

		this.cubeGroup = group
		this.cubeDefinition.front = front
		this.cubeDefinition.middle = middle
		this.cubeDefinition.back = back

		const cubeBoundingBox = new THREE.BoxHelper(this.cubeGroup, new THREE.Color(0x000000))

		this.scene.add(this.cubeGroup)
		this.scene.add(cubeBoundingBox)
	}

	public onCameraChanged(camera: PerspectiveCamera) {
		const newCameraPosition = this.calculateCameraPosition(camera)
		this.setCameraPosition(newCameraPosition)
	}

	private setCameraPosition(cameraPosition: THREE.Vector3) {
		this.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)
		this.camera.lookAt(0, 0, 0)
		this.camera.updateProjectionMatrix()
	}

	private calculateCameraPosition(camera: THREE.PerspectiveCamera) {
		const codeMapTargetVector = this.threeOrbitControlsService.controls.target.clone()
		const codeMapCameraPosition = camera.position.clone()
		return codeMapCameraPosition
			.sub(codeMapTargetVector)
			.normalize()
			.multiplyScalar(3)
	}

	private startAnimation() {
		const animate = () => {
			requestAnimationFrame(animate)
			this.onAnimationFrame()
		}
		animate()
	}

	private onAnimationFrame() {
		this.renderer.render(this.scene, this.camera)
	}

	private initScene() {
		this.scene = new THREE.Scene()
	}

	private initRenderer($element: any) {
		this.renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true
		})
		this.renderer.setSize(this.WIDTH, this.HEIGHT)
		$element[0].appendChild(this.renderer.domElement)
	}

	private initCamera() {
		this.camera = new THREE.PerspectiveCamera(45, this.WIDTH / this.HEIGHT, 0.1, 1000)
		this.camera.position.z = 4
	}

	public onCubeHovered(cube: THREE.Mesh) {
		this.hoverInfo = {
			cube,
			originalMaterial: cube.material
		}
		this.hoverInfo.cube.material.emissive = new THREE.Color(0xffffff)
	}

	public onCubeUnhovered() {
		this.hoverInfo.cube.material.emissive = new THREE.Color(0x000000)
		this.hoverInfo.cube = null
	}

	public onCubeClicked(cube: THREE.Mesh) {
		switch (cube) {
			case this.cubeDefinition.front.top.middle:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(0, -1, -1)
				break
			case this.cubeDefinition.front.top.left:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(1, -1, -1)
				break
			case this.cubeDefinition.front.top.right:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(-1, -1, -1)
				break

			case this.cubeDefinition.front.middle.middle:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(0, 0, 0)
				break
			case this.cubeDefinition.front.middle.left:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(1, 0, -1)
				break
			case this.cubeDefinition.front.middle.right:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(-1, 0, -1)
				break

			case this.cubeDefinition.front.bottom.middle:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(0, 1, -1)
				break
			case this.cubeDefinition.front.bottom.left:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(1, 1, -1)
				break
			case this.cubeDefinition.front.bottom.right:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(-1, 1, -1)
				break

			case this.cubeDefinition.middle.middle.right:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(-1, 0, 0)
				break
			case this.cubeDefinition.middle.top.right:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(-1, -1, 0)
				break
			case this.cubeDefinition.middle.bottom.right:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(-1, 1, 0)
				break

			case this.cubeDefinition.middle.middle.left:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(1, 0, 0)
				break
			case this.cubeDefinition.middle.top.left:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(1, -1, 0)
				break
			case this.cubeDefinition.middle.bottom.left:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(1, 1, 0)
				break

			case this.cubeDefinition.middle.top.middle:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(0, -1, 0)
				break
			case this.cubeDefinition.middle.bottom.middle:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(0, 1, 0)
				break

			case this.cubeDefinition.back.top.middle:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(0, -1, 1)
				break
			case this.cubeDefinition.back.top.left:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(1, -1, 1)
				break
			case this.cubeDefinition.back.top.right:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(-1, -1, 1)
				break

			case this.cubeDefinition.back.middle.middle:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(0, 0, 1)
				break
			case this.cubeDefinition.back.middle.left:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(-1, 0, 1)
				break
			case this.cubeDefinition.back.middle.right:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(1, 0, 1)
				break

			case this.cubeDefinition.back.bottom.middle:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(0, 1, 1)
				break
			case this.cubeDefinition.back.bottom.left:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(-1, 1, 1)
				break
			case this.cubeDefinition.back.bottom.right:
				this.threeOrbitControlsService.rotateCameraInVectorDirection(1, 1, 1)
				break
		}
	}

	private initLights() {
		this.lights = new THREE.Group()
		const ambilight = new THREE.AmbientLight(0x707070, 1.2) // soft white light
		const light1 = new THREE.DirectionalLight(0xe0e0e0, 0.4)
		light1.position.set(50, 10, 8).normalize()
		light1.castShadow = false
		light1.shadow.camera.right = 5
		light1.shadow.camera.left = -5
		light1.shadow.camera.top = 5
		light1.shadow.camera.bottom = -5
		light1.shadow.camera.near = 2
		light1.shadow.camera.far = 100

		const light2 = new THREE.DirectionalLight(0xe0e0e0, 0.4)
		light2.position.set(-50, 10, -8).normalize()
		light2.castShadow = false
		light2.shadow.camera.right = 5
		light2.shadow.camera.left = -5
		light2.shadow.camera.top = 5
		light2.shadow.camera.bottom = -5
		light2.shadow.camera.near = 2
		light2.shadow.camera.far = 100

		this.lights.add(ambilight)
		this.lights.add(light1)
		this.lights.add(light2)

		this.scene.add(this.lights)
	}
}

export const viewCubeComponent = {
	selector: "viewCubeComponent",
	template: require("./viewCube.component.html"),
	controller: ViewCubeController
}
