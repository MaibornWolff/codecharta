import { ThreeSceneService } from "./threeSceneService"
import { ThreeCameraService } from "./threeCameraService"
import { ThreeOrbitControlsService } from "./threeOrbitControlsService"
import { ThreeRendererService } from "./threeRendererService"
import { ThreeUpdateCycleService } from "./threeUpdateCycleService"

import { ThreeStatsService } from "./threeStatsService"
export class ThreeViewerService {
	private animationFrameId: number

	constructor(
		private threeSceneService: ThreeSceneService,
		private threeCameraService: ThreeCameraService,
		private threeOrbitControlsService: ThreeOrbitControlsService,
		private threeRendererService: ThreeRendererService,
		private threeUpdateCycleService: ThreeUpdateCycleService,
		private threeStatsService: ThreeStatsService
	) {
		"ngInject"
	}

	init(canvasElement: Element) {
		this.threeCameraService.init(window.innerWidth, window.innerHeight)
		const {
			threeSceneService: { scene },
			threeCameraService: { camera },
			threeRendererService,
			threeStatsService,
			threeOrbitControlsService,
			onWindowResize,
			onFocusIn,
			onFocusOut
		} = this
		camera.lookAt(scene.position)
		scene.add(camera)
		threeRendererService.init(window.innerWidth, window.innerHeight, scene, camera)
		threeStatsService.init(canvasElement)
		threeOrbitControlsService.init(threeRendererService.renderer.domElement)

		canvasElement.append(threeRendererService.renderer.domElement)

		window.addEventListener("resize", onWindowResize)
		window.addEventListener("focusin", onFocusIn)
		window.addEventListener("focusout", onFocusOut)
	}

	onWindowResize = () => {
		this.threeSceneService.scene.updateMatrixWorld(false)
		this.threeRendererService.renderer.setSize(window.innerWidth, window.innerHeight)
		this.threeCameraService.camera.aspect = window.innerWidth / window.innerHeight
		this.threeCameraService.camera.updateProjectionMatrix()
		this.animate()
	}

	enableRotation(value: boolean) {
		this.threeOrbitControlsService.controls.enableRotate = value
	}

	onFocusIn = event => {
		if (event.target.nodeName === "INPUT") {
			this.threeOrbitControlsService.controls.enableKeys = false
		}
	}

	onFocusOut = event => {
		if (event.target.nodeName === "INPUT") {
			this.threeOrbitControlsService.controls.enableKeys = true
		}
	}

	animate() {
		this.threeOrbitControlsService.controls.update()
		this.threeUpdateCycleService.update()
	}

	animateStats() {
		this.animationFrameId = requestAnimationFrame(() => this.animateStats())
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
		window.removeEventListener("resize", this.onWindowResize)
		window.removeEventListener("focusin", this.onFocusIn)
		window.removeEventListener("focusout", this.onFocusOut)
		this.dispose()
		this.threeStatsService.destroy()
		this.getRenderCanvas().remove()
		this.dispose()
	}
}
