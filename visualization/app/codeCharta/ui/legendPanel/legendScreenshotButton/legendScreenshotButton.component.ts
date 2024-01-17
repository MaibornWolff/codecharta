import html2canvas from "html2canvas"
import { State, Store } from "@ngrx/store"
import { Component, Input, ViewEncapsulation } from "@angular/core"

import { CcState } from "../../../codeCharta.model"
import { IsAttributeSideBarVisibleService } from "../../../services/isAttributeSideBarVisible.service"
import { screenshotToClipboardEnabledSelector } from "../../../state/store/appSettings/enableClipboard/screenshotToClipboardEnabled.selector"
import { createPNGFileName } from "../../../model/files/files.helper"
import { checkWriteToClipboardAllowed, setToClipboard } from "../../../util/clipboard/clipboardWriter"

@Component({
	selector: "cc-legend-screenshot-button",
	templateUrl: "./legendScreenshotButton.component.html",
	styleUrls: ["./legendScreenshotButton.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class LegendScreenshotButtonComponent {
	@Input() isLegendVisible: boolean
	isRenderingScreenshot: boolean
	isWriteToClipboardAllowed: boolean = checkWriteToClipboardAllowed()
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
		const files = this.state.getValue().files
		this.downloadScreenshot(dataUrl, createPNGFileName(files, "legend"))
		this.isRenderingScreenshot = false
	}

	async makeScreenshotToClipboard() {
		this.isRenderingScreenshot = true
		const element = this.getLegendPanelHTMLElement()
		const canvas = await this.captureScreenshot(element)
		const blob: Blob = await new Promise(resolve => canvas.toBlob(resolve))
		await setToClipboard(blob)
		this.isRenderingScreenshot = false
	}

	private getLegendPanelHTMLElement() {
		return document.getElementById("legend-panel")
	}

	private async captureScreenshot(element: HTMLElement): Promise<HTMLCanvasElement> {
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

	private downloadScreenshot(dataUrl: string, fileName: string): void {
		const downloadLink = document.createElement("a")
		downloadLink.download = fileName
		downloadLink.href = dataUrl
		document.body.appendChild(downloadLink)
		downloadLink.click()
		downloadLink.remove()
	}
}
