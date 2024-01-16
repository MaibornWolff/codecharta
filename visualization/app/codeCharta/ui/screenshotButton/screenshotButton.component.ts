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
import { checkWriteToClipBoardAllowed, setToClipboard } from "../../../../app/codeCharta/util/clipboard/clipboardWriter"

@Component({
	selector: "cc-screenshot-button",
	templateUrl: "./screenshotButton.component.html",
	encapsulation: ViewEncapsulation.None
})
export class ScreenshotButtonComponent {
	TITLE_FILE_BUTTON: string
	TITLE_CLIPBOARD_BUTTON: string
	isWriteToClipboardAllowed: boolean
	SCREENSHOT_HOTKEY_TO_FILE = "Ctrl+Alt+S"
	SCREENSHOT_HOTKEY_TO_CLIPBOARD = "Ctrl+Alt+F"
	isScreenshotToClipboardEnabled$ = this.store.select(screenshotToClipboardEnabledSelector)

	constructor(
		private threeCameraService: ThreeCameraService,
		private threeSceneService: ThreeSceneService,
		private threeRendererService: ThreeRendererService,
		private store: Store<CcState>,
		private state: State<CcState>
	) {}

	ngOnInit() {
		this.isWriteToClipboardAllowed = checkWriteToClipBoardAllowed()
		this.TITLE_CLIPBOARD_BUTTON = this.createTitleClipboardButton()
		this.TITLE_FILE_BUTTON = this.createTitleFileButton()

		hotkeys(this.SCREENSHOT_HOTKEY_TO_FILE, () => {
			this.makeScreenshotToFile()
		})
		hotkeys(this.SCREENSHOT_HOTKEY_TO_CLIPBOARD, () => {
			this.makeScreenshotToClipboard()
		})
	}

	makeScreenshotToFile() {
		const link = document.createElement("a")
		const files = this.state.getValue().files
		link.download = createPNGFileName(files, "map")
		link.onclick = () => this.downloadScreenshot(link)
		link.click()
	}

	async makeScreenshotToClipboard() {
		if (!this.isWriteToClipboardAllowed) {
			return
		}
		const renderer = this.threeRendererService.renderer
		const settings = this.saveSettings(renderer)
		const canvas = this.buildScreenShotCanvas(renderer)
		canvas.toBlob(blob => {
			setToClipboard(blob)
		})
		this.applySettings(renderer, settings)
	}

	private downloadScreenshot(link: HTMLAnchorElement) {
		const renderer = this.threeRendererService.renderer
		const settings = this.saveSettings(renderer)
		const canvas = this.buildScreenShotCanvas(renderer)
		link.href = canvas.toDataURL()
		this.applySettings(renderer, settings)
	}

	private saveSettings(renderer: WebGLRenderer) {
		const pixelRatio = renderer.getPixelRatio()
		const clearColor = new Color()
		renderer.getClearColor(clearColor)
		return { pixelRatio, clearColor }
	}

	private applySettings(renderer: WebGLRenderer, settings: { pixelRatio: number; clearColor: Color }) {
		const { pixelRatio, clearColor } = settings
		renderer.setPixelRatio(pixelRatio)
		renderer.setClearColor(clearColor)
		renderer.render(this.threeSceneService.scene, this.threeCameraService.camera)
	}

	private buildScreenShotCanvas(renderer: WebGLRenderer): HTMLCanvasElement {
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.setClearColor(new Color(0, 0, 0), 0)
		renderer.render(this.threeSceneService.scene, this.threeCameraService.camera)

		const canvas = renderer.domElement
		return canvas
	}

	private createTitleClipboardButton() {
		return this.isWriteToClipboardAllowed
			? `Screenshot the map with ${this.SCREENSHOT_HOTKEY_TO_CLIPBOARD} (copy to clipboard) or ${this.SCREENSHOT_HOTKEY_TO_FILE} (save as file)`
			: "Firefox does support copying to clipboard"
	}

	private createTitleFileButton() {
		return `Screenshot the map with ${this.SCREENSHOT_HOTKEY_TO_FILE} (save as file) or ${this.SCREENSHOT_HOTKEY_TO_CLIPBOARD} (copy to clipboard)`
	}
}
