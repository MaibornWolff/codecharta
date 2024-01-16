import { Color, WebGLRenderer } from "three"
import { createPNGFileName } from "../../model/files/files.helper"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCamera.service"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import hotkeys from "hotkeys-js"

import { Component, ViewEncapsulation } from "@angular/core"
import { screenshotToClipboardEnabledSelector } from "../../state/store/appSettings/enableClipboard/screenshotToClipboardEnabled.selector"
import { ThreeRendererService } from "../codeMap/threeViewer/threeRenderer.service"
import { Store, State } from "@ngrx/store"
import { CcState } from "../../codeCharta.model"

@Component({
	selector: "cc-screenshot-button",
	templateUrl: "./screenshotButton.component.html",
	encapsulation: ViewEncapsulation.None
})
export class ScreenshotButtonComponent {
	SCREENSHOT_HOTKEY_TO_FILE = "Ctrl+Alt+S"
	SCREENSHOT_HOTKEY_TO_CLIPBOARD = "Ctrl+Alt+F"
	isScreenshotToClipboardEnabled$ = this.store.select(screenshotToClipboardEnabledSelector)

	constructor(
		private threeCameraService: ThreeCameraService,
		private threeSceneService: ThreeSceneService,
		private threeRendererService: ThreeRendererService,
		private store: Store<CcState>,
		private state: State<CcState>
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
		const files = this.state.getValue().files
		link.download = createPNGFileName(files, "map")
		link.onclick = () => this.loadScript(link, this.threeRendererService.renderer)
		link.click()
	}

	private loadScript(link: HTMLAnchorElement, renderer: WebGLRenderer) {
		this.buildScreenShotCanvas(renderer)

		link.href = renderer.domElement.toDataURL()
	}

	makeScreenshotToClipBoard() {
		const renderer = this.threeRendererService.renderer
		this.buildScreenShotCanvas(renderer)

		renderer.domElement.toBlob(blob => {
			navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]).catch(() => {
				// We can add a popup on failure here, explaining the problem
			})
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
