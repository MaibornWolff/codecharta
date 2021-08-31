import { Color, WebGLRenderer } from "three"
import { getVisibleFileStates, isDeltaState, isPartialState, isSingleState } from "../../model/files/files.helper"
import { StoreService } from "../../state/store.service"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCameraService"
import { ThreeRendererService } from "../codeMap/threeViewer/threeRendererService"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import hotkeys from "hotkeys-js"
import "./screenshotButton.component.scss"

export class ScreenshotButtonController {
	SCREENSHOT_HOTKEY = "Ctrl+Alt+S"
	constructor(
		private threeSceneService: ThreeSceneService,
		private threeCameraService: ThreeCameraService,
		private threeRendererService: ThreeRendererService,
		private storeService: StoreService
	) {
		"ngInject"
		hotkeys(this.SCREENSHOT_HOTKEY, () => {
			this.makeScreenshot()
		})
	}

	makeScreenshot() {
		const link = document.createElement("a")
		link.download = this.makePNGFileName()
		link.onclick = () => this.loadScript(link, this.threeRendererService.renderer)
		link.click()
	}

	private makePNGFileName() {
		const files = this.storeService.getState().files
		const jsonFileNames = getVisibleFileStates(files)
		const state = isSingleState(files) ? "single" : isPartialState(files) ? "partial" : isDeltaState(files) ? "delta" : ""
		let pngFileName = ""
		for (const fileState of jsonFileNames) {
			const fileName = fileState.file.fileMeta.fileName
			pngFileName += `${fileName.slice(0, fileName.indexOf(".json"))}_`
		}
		return `${state}_${pngFileName.slice(0, pngFileName.lastIndexOf("_"))}.png`
	}

	private loadScript(link: HTMLAnchorElement, renderer: WebGLRenderer) {
		const currentClearColor = new Color()
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.getClearColor(currentClearColor)

		renderer.setClearColor(0x00_00_00, 0)
		this.threeSceneService.scene.background = null
		renderer.render(this.threeSceneService.scene, this.threeCameraService.camera)
		renderer.setClearColor(currentClearColor)

		link.href = renderer.domElement.toDataURL()
		renderer.setPixelRatio(1)
	}
}

export const screenshotButtonComponent = {
	selector: "screenshotButtonComponent",
	template: require("./screenshotButton.component.html"),
	controller: ScreenshotButtonController
}
