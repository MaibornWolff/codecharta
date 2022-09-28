import { Color, WebGLRenderer } from "three"
import { getVisibleFileStates, isDeltaState, isPartialState } from "../../model/files/files.helper"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCamera.service"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import hotkeys from "hotkeys-js"

import { Component, Inject } from "@angular/core"
import { ThreeCameraServiceToken, ThreeSceneServiceToken } from "../../services/ajs-upgraded-providers"
import { State } from "../../state/angular-redux/state"
import { Store } from "../../state/angular-redux/store"
import { screenshotToClipboardEnabledSelector } from "../../state/store/appSettings/enableClipboard/screenshotToClipboardEnabled.selector"
import { ThreeRendererService } from "../codeMap/threeViewer/threeRenderer.service"

@Component({
	selector: "cc-screenshot-button",
	template: require("./screenshotButton.component.html")
})
export class ScreenshotButtonComponent {
	SCREENSHOT_HOTKEY_TO_FILE = "Ctrl+Alt+S"
	SCREENSHOT_HOTKEY_TO_CLIPBOARD = "Ctrl+Alt+F"
	isScreenshotToClipboardEnabled$ = this.store.select(screenshotToClipboardEnabledSelector)

	constructor(
		@Inject(ThreeCameraServiceToken) private threeCameraService: ThreeCameraService,
		@Inject(ThreeSceneServiceToken) private threeSceneService: ThreeSceneService,
		@Inject(ThreeRendererService) private threeRendererService: ThreeRendererService,
		@Inject(Store) private store: Store,
		@Inject(State) private state: State
	) {
		hotkeys(this.SCREENSHOT_HOTKEY_TO_FILE, () => {
			this.makeScreenshotToFile()
		})
		hotkeys(this.SCREENSHOT_HOTKEY_TO_CLIPBOARD, () => {
			this.makeScreenshotToClipBoard()
		})
	}

	makeScreenshotToFile() {
		const link = document.createElement("a")
		link.download = this.makePNGFileName()
		link.onclick = () => this.loadScript(link, this.threeRendererService.renderer)
		link.click()
	}

	private makePNGFileName() {
		const files = this.state.getValue().files
		const jsonFileNames = getVisibleFileStates(files)
		const state = isPartialState(files) ? "partial" : isDeltaState(files) ? "delta" : ""
		let pngFileName = ""
		for (const fileState of jsonFileNames) {
			const fileName = fileState.file.fileMeta.fileName
			pngFileName += `${fileName.slice(0, fileName.indexOf(".json"))}_`
		}
		return `${state}_${pngFileName.slice(0, pngFileName.lastIndexOf("_"))}.png`
	}

	private loadScript(link: HTMLAnchorElement, renderer: WebGLRenderer) {
		this.buildScreenShotCanvas(renderer)

		link.href = renderer.domElement.toDataURL()
	}

	makeScreenshotToClipBoard() {
		const renderer = this.threeRendererService.renderer
		this.buildScreenShotCanvas(renderer)

		renderer.domElement.toBlob(blob => {
			navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
		})
	}

	private buildScreenShotCanvas(renderer: WebGLRenderer) {
		const currentClearColor = new Color()
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.getClearColor(currentClearColor)

		renderer.setClearColor(0x00_00_00, 0)
		this.threeSceneService.scene.background = null
		renderer.render(this.threeSceneService.scene, this.threeCameraService.camera)
		renderer.setClearColor(currentClearColor)
	}
}
