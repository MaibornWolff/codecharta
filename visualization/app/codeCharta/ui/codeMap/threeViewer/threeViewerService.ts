"use strict"

import { ThreeSceneService } from "./threeSceneService"
import { ThreeCameraService } from "./threeCameraService"
import { ThreeOrbitControlsService } from "./threeOrbitControlsService"
import { ThreeRendererService } from "./threeRendererService"
import { ThreeUpdateCycleService } from "./threeUpdateCycleService"
import { ThreeStatsService } from "./threeStatsService"
export class ThreeViewerService {

	/* ngInject */
	constructor(
		private threeSceneService: ThreeSceneService,
		private threeCameraService: ThreeCameraService,
		private threeOrbitControlsService: ThreeOrbitControlsService,
		private threeRendererService: ThreeRendererService,
		private threeUpdateCycleService: ThreeUpdateCycleService,
		private threeStatsService : ThreeStatsService
	) {}

	init(canvasElement: Element) {
		this.threeCameraService.init(window.innerWidth, window.innerHeight)
		const { threeSceneService : {scene}, threeCameraService : {camera} } = this
		camera.lookAt(scene.position)
		scene.add(camera)
		this.threeRendererService.init(window.innerWidth, window.innerHeight,scene, camera)
		this.threeStatsService.init(canvasElement)
		this.threeOrbitControlsService.init(this.threeRendererService.renderer.domElement)
		this.threeRendererService.renderer.setPixelRatio(window.devicePixelRatio)  // TODO needs ui progressbar (from 1 to window.devicePixelRatio)

		canvasElement.appendChild(this.threeRendererService.renderer.domElement)

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

	dispose() {
		this.threeRendererService?.composer?.dispose()
	}

	animate() {
		requestAnimationFrame(() => this.animate())
		this.threeRendererService.render()
		this.threeOrbitControlsService.controls.update()
		this.threeUpdateCycleService.update()
		this.threeStatsService.updateStats()
	}
}
