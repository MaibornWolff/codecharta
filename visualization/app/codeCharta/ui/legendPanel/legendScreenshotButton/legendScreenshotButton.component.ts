import html2canvas from "html2canvas"
import { State, Store } from "@ngrx/store"
import { Component, Input, ViewEncapsulation } from "@angular/core"

import { CcState } from "../../../../../app/codeCharta/codeCharta.model"
import { IsAttributeSideBarVisibleService } from "../../../../../app/codeCharta/services/isAttributeSideBarVisible.service"
import { screenshotToClipboardEnabledSelector } from "../../../../../app/codeCharta/state/store/appSettings/enableClipboard/screenshotToClipboardEnabled.selector"
import { getVisibleFileStates, isDeltaState, isPartialState } from "../../../../../app/codeCharta/model/files/files.helper"

@Component({
	selector: "cc-legend-screenshot-button",
	templateUrl: "./legendScreenshotButton.component.html",
	styleUrls: ["./legendScreenshotButton.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class LegendScreenshotButtonComponent {
	@Input() isLegendVisible: boolean
	isRenderingScreenshot: boolean
	isWriteToClipboardAllowed: boolean = "write" in navigator.clipboard
	isScreenshotToClipboardEnabled$ = this.store.select(screenshotToClipboardEnabledSelector)

	constructor(
		private store: Store<CcState>,
		private state: State<CcState>,
		public isAttributeSideBarVisibleService: IsAttributeSideBarVisibleService
	) {}

	async makeScreenshotToFile() {
		this.isRenderingScreenshot = true
		const element = this.getLegendPanelHTMLElement()
		const canvas = await this.captureScreenshot(element)
		const dataUrl = canvas.toDataURL("image/png")
		this.downloadScreenshot(dataUrl, this.makePNGFileName())
		this.isRenderingScreenshot = false
	}

	async makeScreenshotToClipboard() {
		this.isRenderingScreenshot = true
		const element = this.getLegendPanelHTMLElement()
		const canvas = await this.captureScreenshot(element)
		const blob: Blob = await new Promise(resolve => canvas.toBlob(resolve))
		await this.setToClipboard(blob)
		this.isRenderingScreenshot = false
	}

	getLegendPanelHTMLElement() {
		return document.getElementById("legend-panel")
	}

	async captureScreenshot(element: HTMLElement): Promise<HTMLCanvasElement> {
		const tagsNamesToIgnore = new Set([
			"cc-tool-bar",
			"cc-file-extension-bar",
			"cc-ribbon-bar",
			"cc-code-map",
			"cc-attribute-side-bar",
			"cc-loading-file-progess-spinner"
		])
		return html2canvas(element, {
			removeContainer: true,
			scale: 2,
			allowTaint: true,
			ignoreElements(element) {
				return tagsNamesToIgnore.has(element.tagName.toLowerCase())
			}
		})
	}

	downloadScreenshot(dataUrl: string, fileName: string): void {
		const downloadLink = document.createElement("a")
		downloadLink.download = fileName
		downloadLink.href = dataUrl
		document.body.appendChild(downloadLink)
		downloadLink.click()
		downloadLink.remove()
	}

	async setToClipboard(blob: Blob) {
		const data = [new ClipboardItem({ [blob.type]: blob })]
		await navigator.clipboard.write(data)
	}

	makePNGFileName(): string {
		const files = this.state.getValue().files
		const jsonFileNames = getVisibleFileStates(files)
		const state = isPartialState(files) ? "partial" : isDeltaState(files) ? "delta" : ""
		const pngFileName = `${jsonFileNames
			.map(fileState => fileState.file.fileMeta.fileName.slice(0, fileState.file.fileMeta.fileName.indexOf(".json")))
			.join("_")}_legend`

		return `${state}_${pngFileName}.png`
	}
}
