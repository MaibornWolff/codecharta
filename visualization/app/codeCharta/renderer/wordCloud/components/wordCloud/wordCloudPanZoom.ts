import type { ECharts } from "echarts/core"
import {
    CloudPoint,
    CloudViewport,
    isWholeCloud,
    keepCloudInSight,
    panBy,
    WHOLE_CLOUD,
    ZOOM_STEP,
    zoomAt
} from "../../util/wordCloudViewport"

const PRIMARY_BUTTON = 0

interface ZrenderPointerEvent {
    offsetX: number
    offsetY: number
    wheelDelta?: number
    event?: Event
}

interface WordGroup {
    attr: (transform: { x: number; y: number; scaleX: number; scaleY: number }) => void
}

interface EchartsWithSeriesView {
    getModel: () => { getSeriesByIndex: (index: number) => unknown } | undefined
    getViewOfSeriesModel: (seriesModel: unknown) => { group?: WordGroup } | undefined
}

/** Magnifies and pans the cloud by transforming the group its words are drawn into. The words are
 * redrawn as text at the new size, so they stay sharp and keep answering clicks, and nothing is laid
 * out again — every word stays where the reader last saw it. */
export class WordCloudPanZoom {
    private viewport: CloudViewport = WHOLE_CLOUD
    private lastDragPoint: CloudPoint | null = null

    constructor(private readonly chart: ECharts) {
        const zrender = chart.getZr()
        zrender.on("mousewheel", (event: unknown) => this.zoom(event as ZrenderPointerEvent))
        zrender.on("mousedown", (event: unknown) => this.startDragging(event as ZrenderPointerEvent))
        zrender.on("mousemove", (event: unknown) => this.drag(event as ZrenderPointerEvent))
        zrender.on("mouseup", () => this.stopDragging())
        zrender.on("globalout", () => this.stopDragging())
    }

    showWholeCloud(): void {
        this.show(WHOLE_CLOUD)
    }

    /** A new layout draws into a new group, which knows nothing of the magnification, and the container
     * may have been resized since the cloud was last panned. */
    restoreAfterLayout(): void {
        if (isWholeCloud(this.viewport)) {
            return
        }
        this.show(keepCloudInSight(this.viewport, this.containerSize()))
    }

    private zoom(pointer: ZrenderPointerEvent): void {
        const wheelDelta = pointer.wheelDelta ?? 0
        if (wheelDelta === 0) {
            return
        }
        pointer.event?.preventDefault()
        const factor = wheelDelta > 0 ? ZOOM_STEP : 1 / ZOOM_STEP
        this.show(zoomAt(this.viewport, { x: pointer.offsetX, y: pointer.offsetY }, factor, this.containerSize()))
    }

    private startDragging(pointer: ZrenderPointerEvent): void {
        if (isPrimaryPress(pointer)) {
            this.lastDragPoint = { x: pointer.offsetX, y: pointer.offsetY }
        }
    }

    private drag(pointer: ZrenderPointerEvent): void {
        const lastDragPoint = this.lastDragPoint
        if (!lastDragPoint) {
            return
        }
        const dragPoint = { x: pointer.offsetX, y: pointer.offsetY }
        this.lastDragPoint = dragPoint
        this.show(panBy(this.viewport, { x: dragPoint.x - lastDragPoint.x, y: dragPoint.y - lastDragPoint.y }, this.containerSize()))
    }

    private stopDragging(): void {
        this.lastDragPoint = null
    }

    private show(viewport: CloudViewport): void {
        this.viewport = viewport
        this.wordGroup()?.attr({ x: viewport.x, y: viewport.y, scaleX: viewport.scale, scaleY: viewport.scale })
    }

    private wordGroup(): WordGroup | undefined {
        const chart = this.chart as unknown as EchartsWithSeriesView
        const seriesModel = chart.getModel()?.getSeriesByIndex(0)
        return seriesModel ? chart.getViewOfSeriesModel(seriesModel)?.group : undefined
    }

    private containerSize() {
        return { width: this.chart.getWidth(), height: this.chart.getHeight() }
    }
}

/** A touch carries no button and drags like the primary one. */
function isPrimaryPress({ event }: ZrenderPointerEvent): boolean {
    return !event || !("button" in event) || event.button === PRIMARY_BUTTON
}
