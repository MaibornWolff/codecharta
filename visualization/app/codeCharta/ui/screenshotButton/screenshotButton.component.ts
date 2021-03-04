import { Color, WebGLRenderer } from "three"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCameraService"
import { ThreeRendererService } from "../codeMap/threeViewer/threeRendererService"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import "./screenshotButton.component.scss"

export class ScreenshotButtonController {
	/* @ngInject */
	constructor(
		private threeSceneService: ThreeSceneService,
		private threeCameraService: ThreeCameraService,
		private threeRendererService: ThreeRendererService
	) {}

	makeScreenshot() {
		const link = document.createElement("a")
		link.setAttribute("download", "test.png")
		link.onclick = () => this.loadScript(link, this.threeRendererService.renderer)
		link.click()
	}

	private loadScript(link: HTMLAnchorElement, renderer: WebGLRenderer) {
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
}

export const screenshotButtonComponent = {
	selector: "screenshotButtonComponent",
	template: require("./screenshotButton.component.html"),
	controller: ScreenshotButtonController
}
