import { Injectable, inject } from "@angular/core"
import { createPNGFileName } from "../../../model/files/files.helper"
import { WordCloudChartRegistry } from "../../../renderer/wordCloud/wordCloud.facade"
import { FilesRepo } from "../../../stores/fileStore/fileStore.facade"
import { ScreenshotCapture } from "../screenshotCapture"
import { cropTransparentMargins } from "./canvasCrop"
import { checkWriteToClipboardAllowed, setToClipboard } from "./clipboardWriter"
import { downloadPng } from "./pngScreenshot"

const PNG_MIME_TYPE = "image/png"

@Injectable({ providedIn: "root" })
export class WordCloudScreenshotService implements ScreenshotCapture {
    private readonly chartRegistry = inject(WordCloudChartRegistry)
    private readonly filesRepo = inject(FilesRepo)

    readonly isWriteToClipboardAllowed = checkWriteToClipboardAllowed()
    readonly subject = "word cloud"
    readonly isCaptureAvailable = this.chartRegistry.hasChart

    async makeScreenshotToFile(): Promise<void> {
        const canvas = this.renderScreenshotCanvas()
        if (!canvas) {
            return
        }
        downloadPng(canvas.toDataURL(PNG_MIME_TYPE), createPNGFileName(this.filesRepo.getFiles(), "domain"))
    }

    async makeScreenshotToClipboard(): Promise<void> {
        if (!this.isWriteToClipboardAllowed) {
            return
        }
        const canvas = this.renderScreenshotCanvas()
        if (!canvas) {
            return
        }
        const blob = await new Promise<Blob>(resolve => canvas.toBlob(resolve, PNG_MIME_TYPE))
        await setToClipboard(blob)
    }

    private renderScreenshotCanvas(): HTMLCanvasElement | null {
        const canvas = this.chartRegistry.current()?.getRenderedCanvas({
            pixelRatio: window.devicePixelRatio || 1,
            backgroundColor: "transparent"
        })
        return canvas ? cropTransparentMargins(canvas) : null
    }
}
