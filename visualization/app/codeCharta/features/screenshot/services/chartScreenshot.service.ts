import { inject, Signal } from "@angular/core"
import { createPNGFileName } from "../../../model/files/files.helper"
import { FilesRepo } from "../../../stores/fileStore/fileStore.facade"
import { ChartRegistry } from "../../../util/chartRegistry"
import { ScreenshotCapture } from "../screenshotCapture"
import { cropTransparentMargins } from "./canvasCrop"
import { checkWriteToClipboardAllowed, setToClipboard } from "./clipboardWriter"
import { downloadPng } from "./pngScreenshot"

const PNG_MIME_TYPE = "image/png"

export abstract class ChartScreenshotService implements ScreenshotCapture {
    private readonly filesRepo = inject(FilesRepo)

    protected abstract readonly chartRegistry: ChartRegistry
    protected abstract readonly fileNameSuffix: Parameters<typeof createPNGFileName>[1]

    abstract readonly subject: string
    readonly isWriteToClipboardAllowed = checkWriteToClipboardAllowed()

    get isCaptureAvailable(): Signal<boolean> {
        return this.chartRegistry.hasChart
    }

    async makeScreenshotToFile(): Promise<void> {
        const canvas = this.renderScreenshotCanvas()
        if (!canvas) {
            return
        }
        downloadPng(canvas.toDataURL(PNG_MIME_TYPE), createPNGFileName(this.filesRepo.getFiles(), this.fileNameSuffix))
    }

    async makeScreenshotToClipboard(): Promise<void> {
        if (!this.isWriteToClipboardAllowed) {
            return
        }
        const canvas = this.renderScreenshotCanvas()
        if (!canvas) {
            return
        }
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, PNG_MIME_TYPE))
        if (!blob) {
            return
        }
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
