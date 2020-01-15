"use strict"
import { ThreeSceneService } from "./threeSceneService"
import { ThreeCameraService } from "./threeCameraService"
import { ThreeOrbitControlsService } from "./threeOrbitControlsService"
import { ThreeRendererService } from "./threeRendererService"
import { ThreeUpdateCycleService } from "./threeUpdateCycleService"

export class ThreeViewerService {
	/* ngInject */
	constructor(
		private threeSceneService: ThreeSceneService,
		private threeCameraService: ThreeCameraService,
		private threeOrbitControlsService: ThreeOrbitControlsService,
		private threeRendererService: ThreeRendererService,
		private threeUpdateCycleService: ThreeUpdateCycleService
	) {}

	public init(canvasElement: Element) {
		this.threeCameraService.init(window.innerWidth, window.innerHeight)

		this.threeCameraService.camera.lookAt(this.threeSceneService.scene.position)

		this.threeSceneService.scene.add(this.threeCameraService.camera)

		this.threeRendererService.init(window.innerWidth, window.innerHeight)

		this.threeOrbitControlsService.init(this.threeRendererService.renderer.domElement)

		canvasElement.appendChild(this.threeRendererService.renderer.domElement)

		window.addEventListener("resize", () => this.onWindowResize())
		window.addEventListener("focusin", event => this.onFocusIn(event))
		window.addEventListener("focusout", event => this.onFocusOut(event))
	}

	public onWindowResize() {
		this.threeSceneService.scene.updateMatrixWorld(false)
		this.threeRendererService.renderer.setSize(window.innerWidth, window.innerHeight)
		this.threeCameraService.camera.aspect = window.innerWidth / window.innerHeight
		this.threeCameraService.camera.updateProjectionMatrix()
	}

	public onFocusIn(event) {
		if (event.target.nodeName == "INPUT") {
			this.threeOrbitControlsService.controls.enableKeys = false
		}
	}

	public onFocusOut(event) {
		if (event.target.nodeName == "INPUT") {
			this.threeOrbitControlsService.controls.enableKeys = true
		}
	}

	public animate() {
		requestAnimationFrame(() => this.animate())
		this.threeRendererService.renderer.render(this.threeSceneService.scene, this.threeCameraService.camera)
		this.threeOrbitControlsService.controls.update()
		this.threeUpdateCycleService.update()
	}
}
