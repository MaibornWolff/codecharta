import { Injectable, inject } from "@angular/core"
import { createPNGFileName } from "../../../model/files/files.helper"
import { WordCloudChartRegistry } from "../../../renderer/wordCloud/wordCloud.facade"
import { FilesRepo } from "../../../stores/fileStore/fileStore.facade"
import { ScreenshotCapture } from "../screenshotCapture"
import { cropTransparentMargins } from "./canvasCrop"
import { checkWriteToClipboardAllowed, setToClipboard } from "./clipboardWriter"
import { downloadPng } from "./pngScreenshot"

const PNG_MIME_TYPE = "image/png"

/**
 * The domain view's capture: the word cloud alone. Unlike the map — which is rasterized out of the DOM
 * with html2canvas because its picture includes overlays — the cloud IS a canvas, so ECharts renders the
 * export itself. That keeps the words crisp at the device pixel ratio and keeps explorer, bars and
 * notices out of the image.
 */
@Injectable({ providedIn: "root" })
export class WordCloudScreenshotService implements ScreenshotCapture {
    private readonly chartRegistry = inject(WordCloudChartRegistry)
    private readonly filesRepo = inject(FilesRepo)

    readonly isWriteToClipboardAllowed = checkWriteToClipboardAllowed()
    readonly subject = "word cloud"
    /** No chart while the empty state is shown — there is genuinely nothing to export then. */
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

    /**
     * A transparent background so the export drops onto any slide or document, and cropped to the words
     * because the cloud is laid out into a container far wider than it fills.
     */
    private renderScreenshotCanvas(): HTMLCanvasElement | null {
        const canvas = this.chartRegistry.current()?.getRenderedCanvas({
            pixelRatio: window.devicePixelRatio || 1,
            backgroundColor: "transparent"
        })
        return canvas ? cropTransparentMargins(canvas) : null
    }
}
