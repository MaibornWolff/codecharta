import { Component, ViewEncapsulation } from "@angular/core"
import { State, Store } from "@ngrx/store"
import hotkeys from "hotkeys-js"
import html2canvas from "html2canvas"
import { Color, WebGLRenderer } from "three"
import { checkWriteToClipboardAllowed, setToClipboard } from "../../../../app/codeCharta/util/clipboard/clipboardWriter"
import { CcState } from "../../codeCharta.model"
import { screenshotToClipboardEnabledSelector } from "../../state/store/appSettings/enableClipboard/screenshotToClipboardEnabled.selector"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCamera.service"
import { ThreeRendererService } from "../codeMap/threeViewer/threeRenderer.service"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { createPNGFileName } from "../../model/files/files.helper"
import { FileState } from "../../model/files/files"

@Component({
	selector: "cc-screenshot-button",
	templateUrl: "./screenshotButton.component.html",
	styleUrls: ["./screenshotButton.component.scss"],
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
		this.isWriteToClipboardAllowed = checkWriteToClipboardAllowed()
		this.TITLE_CLIPBOARD_BUTTON = this.createTitleClipboardButton()
		this.TITLE_FILE_BUTTON = this.createTitleFileButton()

		hotkeys(this.SCREENSHOT_HOTKEY_TO_FILE, () => {
			this.makeScreenshotToFile()
		})
		hotkeys(this.SCREENSHOT_HOTKEY_TO_CLIPBOARD, () => {
			this.makeScreenshotToClipboard()
		})
	}

	async makeScreenshotToFile() {
		const renderer = this.threeRendererService.renderer
		const renderSettings = this.saveRenderSettings(renderer)
		const canvas = await this.buildScreenShotCanvas(renderer)

		this.downloadScreenshot(canvas, this.state.getValue().files)
		this.applyRenderSettings(renderer, renderSettings)
	}

	async makeScreenshotToClipboard() {
		if (!this.isWriteToClipboardAllowed) {
			return
		}
		const renderer = this.threeRendererService.renderer
		const renderSettings = this.saveRenderSettings(renderer)
		const canvas = await this.buildScreenShotCanvas(renderer)
		const canvasToBlobPromise: Promise<Blob> = new Promise(resolve => canvas.toBlob(resolve))
		this.applyRenderSettings(renderer, renderSettings)
		const blob = await canvasToBlobPromise
		await setToClipboard(blob)
	}

	private downloadScreenshot(canvas: HTMLCanvasElement, files: FileState[]) {
		const dataUrl = canvas.toDataURL("image/png")
		const downloadLink = document.createElement("a")
		downloadLink.download = createPNGFileName(files, "map")
		downloadLink.href = dataUrl
		document.body.appendChild(downloadLink)
		downloadLink.click()
		downloadLink.remove()
	}

	private saveRenderSettings(renderer: WebGLRenderer) {
		const pixelRatio = renderer.getPixelRatio()
		const clearColor = new Color()
		renderer.getClearColor(clearColor)
		return { pixelRatio, clearColor }
	}

	private applyRenderSettings(renderer: WebGLRenderer, settings: { pixelRatio: number; clearColor: Color }) {
		const { pixelRatio, clearColor } = settings
		renderer.setPixelRatio(pixelRatio)
		renderer.setClearColor(clearColor)
		renderer.render(this.threeSceneService.scene, this.threeCameraService.camera)
	}

	private async buildScreenShotCanvas(renderer: WebGLRenderer): Promise<HTMLCanvasElement> {
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.setClearColor(new Color(0, 0, 0), 0)
		renderer.render(this.threeSceneService.scene, this.threeCameraService.camera)

		const tagsNamesToIgnore = new Set([
			"cc-logo",
			"cc-tool-bar",
			"cc-view-cube",
			"cc-ribbon-bar",
			"cc-file-extension-bar",
			"cc-attribute-side-bar",
			"cc-loading-file-progess-spinner"
		])

		const idsToIgnore = new Set(["legend-panel-button"])

		const bodyHeight = document.querySelector("body")?.offsetHeight
		const ribbonBarHeight = (document.querySelector("cc-ribbon-bar") as HTMLElement)?.offsetHeight
		const toolBarHeight = (document.querySelector("cc-tool-bar") as HTMLElement)?.offsetHeight
		const fileExtensionBarHeight = (document.querySelector("cc-file-extension-bar") as HTMLElement)?.offsetHeight
		const offsetMenuBar = ribbonBarHeight + toolBarHeight + fileExtensionBarHeight

		return html2canvas(document.querySelector("body"), {
			removeContainer: true,
			backgroundColor: "#00",
			scrollY: -offsetMenuBar,
			height: bodyHeight - offsetMenuBar,
			ignoreElements(element) {
				return tagsNamesToIgnore.has(element.tagName.toLowerCase()) || idsToIgnore.has(element.id)
			}
		})
	}

	private createTitleClipboardButton() {
		return this.isWriteToClipboardAllowed
			? `Take a screenshot of the map with ${this.SCREENSHOT_HOTKEY_TO_CLIPBOARD} (copy to clipboard) or ${this.SCREENSHOT_HOTKEY_TO_FILE} (save as file)`
			: "Firefox does not support copying to clipboard"
	}

	private createTitleFileButton() {
		return `Take a screenshot of the map with ${this.SCREENSHOT_HOTKEY_TO_FILE} (save as file) or ${this.SCREENSHOT_HOTKEY_TO_CLIPBOARD} (copy to clipboard)`
	}
}
