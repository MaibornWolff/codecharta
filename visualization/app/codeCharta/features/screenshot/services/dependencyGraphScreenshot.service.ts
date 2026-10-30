import { Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { DependencyGraphChartRegistry } from "../../../renderer/dependencyGraph/dependencyGraphRegistry.facade"
import { GlobalSettingsFacade } from "../../globalSettings/facade"
import { ToastService } from "../../shared/facade"
import { cropToRectangle } from "./canvasCrop"
import { ChartScreenshotService } from "./chartScreenshot.service"

/** A folder takes up only part of the graph, so it is drawn sharper than the whole graph to stay readable. */
const BOX_SCREENSHOT_SCALE = 2
/** A box's outline is stroked on its edge, half of it outside the box. */
const BOX_OUTLINE_MARGIN_PX = 2

@Injectable({ providedIn: "root" })
export class DependencyGraphScreenshotService extends ChartScreenshotService {
    protected readonly chartRegistry = inject(DependencyGraphChartRegistry)
    protected readonly fileNameSuffix = "dependencies"

    private readonly toast = inject(ToastService)
    private readonly isClipboardMode = toSignal(inject(GlobalSettingsFacade).screenshotToClipboardEnabled$(), { requireSync: true })

    readonly subject = "dependency graph"

    canScreenshotBox(path: string): boolean {
        return this.chartRegistry.boxShots.pixelRectOf(path) !== null
    }

    async screenshotBox(path: string, boxName: string): Promise<void> {
        try {
            const canvas = this.renderBoxCanvas(path)
            if (this.isClipboardMode() && this.isWriteToClipboardAllowed) {
                await this.copyToClipboard(canvas)
                this.toast.show(`Screenshot of "${boxName}" copied`, "success")
            } else {
                this.saveToFile(canvas, `dependencies_${boxName}`)
                this.toast.show(`Screenshot of "${boxName}" saved`, "success")
            }
        } catch (error) {
            this.toast.show(`Screenshot of "${boxName}" failed: ${(error as Error).message}`, "error")
        }
    }

    private renderBoxCanvas(path: string): HTMLCanvasElement {
        const boxRect = this.chartRegistry.boxShots.pixelRectOf(path)
        const pixelRatio = (window.devicePixelRatio || 1) * BOX_SCREENSHOT_SCALE
        const chartCanvas = boxRect && this.chartRegistry.boxShots.renderWithEdgesWithin(path, pixelRatio)
        if (!chartCanvas) {
            throw new Error("the folder is not in view")
        }
        const left = Math.max(0, Math.floor((boxRect.x - BOX_OUTLINE_MARGIN_PX) * pixelRatio))
        const top = Math.max(0, Math.floor((boxRect.y - BOX_OUTLINE_MARGIN_PX) * pixelRatio))
        const right = Math.min(chartCanvas.width, Math.ceil((boxRect.x + boxRect.width + BOX_OUTLINE_MARGIN_PX) * pixelRatio))
        const bottom = Math.min(chartCanvas.height, Math.ceil((boxRect.y + boxRect.height + BOX_OUTLINE_MARGIN_PX) * pixelRatio))
        return cropToRectangle(chartCanvas, { x: left, y: top, width: right - left, height: bottom - top })
    }
}
