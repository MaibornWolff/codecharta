"use strict"
import { ThreeSceneService } from "./threeSceneService"
import { ThreeCameraService } from "./threeCameraService"
import { ThreeOrbitControlsService } from "./threeOrbitControlsService"
import { ThreeRendererService } from "./threeRendererService"
import { ThreeUpdateCycleService } from "./threeUpdateCycleService"
import { Color, WebGLRenderer } from "three"

export class ThreeViewerService {
	/* ngInject */
	constructor(
		private threeSceneService: ThreeSceneService,
		private threeCameraService: ThreeCameraService,
		private threeOrbitControlsService: ThreeOrbitControlsService,
		private threeRendererService: ThreeRendererService,
		private threeUpdateCycleService: ThreeUpdateCycleService
	) {}

	private createSaveButton(renderer: WebGLRenderer) {
		const link = document.createElement("a")
		link.appendChild(document.createTextNode("Link"))
		link.setAttribute("download", "test.png")
		link.onclick = () => this.loadScript(link, renderer)
		link.style.left = "0"
		link.style.top = "0"
		link.style.position = "absolute"
		return link
	}

	private loadScript(link, renderer: WebGLRenderer) {
		const currentClearColor = new Color()
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.getClearColor(currentClearColor)

		renderer.setClearColor(0x000000, 0)
		this.threeSceneService.scene.background = null
		renderer.render(this.threeSceneService.scene, this.threeCameraService.camera)
		renderer.setClearColor(currentClearColor)

		link.setAttribute("href", renderer.domElement.toDataURL())
		renderer.setPixelRatio(1)
	}

	init(canvasElement: Element) {
		this.threeCameraService.init(window.innerWidth, window.innerHeight)

		this.threeCameraService.camera.lookAt(this.threeSceneService.scene.position)

		this.threeSceneService.scene.add(this.threeCameraService.camera)

		this.threeRendererService.init(window.innerWidth, window.innerHeight)

		this.threeOrbitControlsService.init(this.threeRendererService.renderer.domElement)

		canvasElement.appendChild(this.threeRendererService.renderer.domElement)

		canvasElement.appendChild(this.createSaveButton(this.threeRendererService.renderer))

		window.addEventListener("resize", () => this.onWindowResize())
		window.addEventListener("focusin", event => this.onFocusIn(event))
		window.addEventListener("focusout", event => this.onFocusOut(event))
	}

	onWindowResize() {
		this.threeSceneService.scene.updateMatrixWorld(false)
		this.threeRendererService.renderer.setSize(window.innerWidth, window.innerHeight)
		this.threeCameraService.camera.aspect = window.innerWidth / window.innerHeight
		this.threeCameraService.camera.updateProjectionMatrix()
	}

	onFocusIn(event) {
		if (event.target.nodeName === "INPUT") {
			this.threeOrbitControlsService.controls.enableKeys = false
		}
	}

	onFocusOut(event) {
		if (event.target.nodeName === "INPUT") {
			this.threeOrbitControlsService.controls.enableKeys = true
		}
	}

	animate() {
		requestAnimationFrame(() => this.animate())
		this.threeRendererService.renderer.render(this.threeSceneService.scene, this.threeCameraService.camera)
		this.threeOrbitControlsService.controls.update()
		this.threeUpdateCycleService.update()
	}
}
