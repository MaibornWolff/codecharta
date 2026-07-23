import { Injectable, inject, signal } from "@angular/core"
import html2canvas from "html2canvas-pro"
import { Color, WebGLRenderer } from "three"
import { FileState } from "../../../model/files/files"
import { createPNGFileName } from "../../../model/files/files.helper"
import { ThreeCameraService, ThreeRendererService, ThreeSceneService } from "../../../renderer/threeViewer/threeViewer.facade"
import { FilesRepo } from "../../../stores/fileStore/fileStore.facade"
import { ScreenshotCapture } from "../screenshotCapture"
import { cropTransparentMargins } from "./canvasCrop"
import { checkWriteToClipboardAllowed, setToClipboard } from "./clipboardWriter"
import { downloadPng } from "./pngScreenshot"

/** The metrics view's capture: the 3D map plus the overlays that are part of the picture. */
@Injectable({ providedIn: "root" })
export class ScreenshotService implements ScreenshotCapture {
    private readonly threeRendererService = inject(ThreeRendererService)
    private readonly threeSceneService = inject(ThreeSceneService)
    private readonly threeCameraService = inject(ThreeCameraService)
    private readonly filesRepo = inject(FilesRepo)

    readonly isWriteToClipboardAllowed = checkWriteToClipboardAllowed()
    readonly subject = "map"
    /** The map is always there to capture — an empty map is still a legitimate screenshot. */
    readonly isCaptureAvailable = signal(true).asReadonly()

    async makeScreenshotToFile(): Promise<void> {
        const renderer = this.threeRendererService.renderer
        const renderSettings = this.saveRenderSettings(renderer)
        const canvas = await this.buildScreenShotCanvas(renderer)

        this.downloadScreenshot(canvas, this.filesRepo.getFiles())
        this.applyRenderSettings(renderer, renderSettings)
    }

    async makeScreenshotToClipboard(): Promise<void> {
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
        downloadPng(canvas.toDataURL("image/png"), createPNGFileName(files, "map"))
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

        const savedLabelStyles = this.prepareLabelsForScreenshot()

        const tagsNamesToIgnore = new Set([
            "cc-logo",
            "cc-tool-bar",
            "cc-view-cube",
            "cc-metrics-bar",
            "cc-file-extension-bar",
            "cc-sidebar-inspector",
            "cc-loading-file-progess-spinner",
            "cc-bottom-bar",
            "cc-sidebar-explorer"
        ])

        const idsToIgnore = new Set(["legend-panel-button"])

        const bodyHeight = document.querySelector("body")?.offsetHeight ?? 0
        const navBarHeight = (document.querySelector("cc-nav-bar") as HTMLElement | null)?.offsetHeight ?? 0
        const fileExtensionBarHeight = (document.querySelector("cc-file-extension-bar") as HTMLElement | null)?.offsetHeight ?? 0
        // the cc-bottom-bar host has zero height (its only child is position:fixed),
        // so measure the inner footer like bottomBar.component does
        const bottomBarElement = document.querySelector("cc-bottom-bar") as HTMLElement | null
        const bottomBarHeight = (bottomBarElement?.querySelector("footer") ?? bottomBarElement)?.offsetHeight ?? 0
        const bottomBarsHeight = fileExtensionBarHeight + bottomBarHeight

        const canvas = await html2canvas(document.querySelector("body"), {
            removeContainer: true,
            backgroundColor: null,
            scrollY: -navBarHeight,
            height: Math.max(0, bodyHeight - navBarHeight - bottomBarsHeight),
            ignoreElements(element) {
                return (
                    tagsNamesToIgnore.has(element.tagName.toLowerCase()) ||
                    idsToIgnore.has(element.id) ||
                    (element as HTMLElement).style.zIndex === "10000"
                )
            }
        })

        this.restoreLabelsAfterScreenshot(savedLabelStyles)

        return cropTransparentMargins(canvas)
    }

    /**
     * html2canvas cannot render backdrop-filter, box-shadow, or transitions.
     * Temporarily swap to opaque backgrounds so labels look correct in screenshots.
     */
    private prepareLabelsForScreenshot(): Map<HTMLElement, string> {
        const saved = new Map<HTMLElement, string>()
        const container = document.querySelector("#codeMapLabels")
        if (!container) {
            return saved
        }

        for (const element of container.querySelectorAll("div")) {
            const el = element as HTMLElement
            if (!el.style.backdropFilter) {
                continue
            }
            saved.set(el, el.style.cssText)
            el.style.backdropFilter = "none"
            el.style.setProperty("-webkit-backdrop-filter", "none")
            el.style.background = "white"
            el.style.boxShadow = "none"
            el.style.border = "1px solid rgba(0, 0, 0, 0.3)"
            el.style.transition = "none"
        }
        return saved
    }

    private restoreLabelsAfterScreenshot(saved: Map<HTMLElement, string>) {
        for (const [el, cssText] of saved) {
            el.style.cssText = cssText
        }
    }
}
