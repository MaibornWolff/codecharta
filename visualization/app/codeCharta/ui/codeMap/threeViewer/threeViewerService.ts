import { ThreeSceneService } from "./threeSceneService"
import { ThreeCameraService } from "./threeCamera.service"
import { ThreeOrbitControlsService } from "./threeOrbitControlsService"
import { ThreeRendererService } from "./threeRenderer.service"
import { ThreeStatsService } from "./threeStats.service"

export class ThreeViewerService {
	private animationFrameId: number

	constructor(
		private threeSceneService: ThreeSceneService,
		private threeCameraService: ThreeCameraService,
		private threeOrbitControlsService: ThreeOrbitControlsService,
		private threeRendererService: ThreeRendererService,
		private threeStatsService: ThreeStatsService
	) {
		"ngInject"
	}

	init(target: Element) {
		this.threeCameraService.init(window.innerWidth, window.innerHeight)

		const camera = this.threeCameraService.camera
		const scene = this.threeSceneService.scene
		camera.lookAt(scene.position)
		scene.add(camera)
		this.threeRendererService.init(window.innerWidth, window.innerHeight, scene, camera)
		this.threeStatsService.init(target)
		this.threeOrbitControlsService.init(this.threeRendererService.renderer.domElement)

		target.append(this.threeRendererService.renderer.domElement)

		window.addEventListener("resize", this.onWindowResize)
		window.addEventListener("focusin", this.onFocusIn)
		window.addEventListener("focusout", this.onFocusOut)

		this.animate()
		this.animateStats()
	}

	restart(target: Element) {
		this.stopAnimate()
		this.destroy()
		this.init(target)
		this.autoFitTo()
		this.animate()
		this.animateStats()
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
		this.threeRendererService.render()
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
