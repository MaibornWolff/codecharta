"use strict"

import { ThreeSceneService } from "./threeSceneService"
import { ThreeCameraService } from "./threeCameraService"
import { ThreeOrbitControlsService } from "./threeOrbitControlsService"
import { ThreeRendererService } from "./threeRendererService"
import { ThreeUpdateCycleService } from "./threeUpdateCycleService"
import { ThreeStatsService } from "./threeStatsService"
export class ThreeViewerService {
	private animationFrameId: number

	/* ngInject */
	constructor(
		private threeSceneService: ThreeSceneService,
		private threeCameraService: ThreeCameraService,
		private threeOrbitControlsService: ThreeOrbitControlsService,
		private threeRendererService: ThreeRendererService,
		private threeUpdateCycleService: ThreeUpdateCycleService,
		private threeStatsService: ThreeStatsService
	) {}

	init(canvasElement: Element) {
		this.threeCameraService.init(window.innerWidth, window.innerHeight)
		const {
			threeSceneService: { scene },
			threeCameraService: { camera }
		} = this
		camera.lookAt(scene.position)
		scene.add(camera)
		this.threeRendererService.init(window.innerWidth, window.innerHeight, scene, camera)
		this.threeStatsService.init(canvasElement)
		this.threeOrbitControlsService.init(this.threeRendererService.renderer.domElement)

		canvasElement.appendChild(this.threeRendererService.renderer.domElement)

		// TODO do we need to remove these listeners ?
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
		this.animationFrameId = requestAnimationFrame(() => this.animate())
		this.threeRendererService.render()
		this.threeOrbitControlsService.controls.update()
		this.threeUpdateCycleService.update()
		this.threeStatsService.updateStats()
	}

	getRenderCanvas() {
		return this.threeRendererService.renderer.domElement
	}

	getRenderLoseExtention() {
		const gl = this.threeRendererService.renderer.getContext()
		return gl.getExtension("WEBGL_lose_context")
	}

	autoFitTo() {
		this.threeOrbitControlsService.autoFitTo()
	}

	stopAnimate() {
		cancelAnimationFrame(this.animationFrameId)
	}

	dispose() {
		this.threeRendererService?.composer?.dispose()
		this.threeRendererService?.renderer?.dispose()
	}

	destroy() {
		this.threeStatsService.destroy()
		this.getRenderCanvas().remove()
		//this.getRenderLoseExtention().loseContext()
		this.dispose()
	}
}
