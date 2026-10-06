import { CustomChart } from "echarts/charts"
import { AriaComponent, DataZoomInsideComponent, GridComponent, TooltipComponent } from "echarts/components"
import * as echarts from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import { ContainerSizeObserver } from "../../../../util/containerSizeObserver"
import { suppressBrowserMenu } from "../../../../util/suppressBrowserMenu"
import { DependencyGraphChartRegistry } from "../../services/dependencyGraphChart.registry"
import { AxisWindow, Viewport, windowResizedTo } from "../../util/axisWindow"
import { CYCLE_BADGE_INFO } from "../../util/boxMarks"
import { TOGGLE_INFO } from "../../util/dependencyGraphBoxes"
import { GRAPH_SERIES_ID, GraphDatum } from "../../util/dependencyGraphSeries"
import { Point } from "../../util/geometry"
import { BoxDragGesture, BoxDragHandlers, layoutPointAt } from "./boxDragGesture"
import { PanKey } from "./panKey"

echarts.use([CustomChart, CanvasRenderer, GridComponent, DataZoomInsideComponent, TooltipComponent, AriaComponent])

export interface DependencyGraphHandlers extends BoxDragHandlers {
    onBoxClicked: (path: string) => void
    onBoxToggled: (path: string) => void
    onCycleBadgeClicked: (path: string) => void
    onEdgeClicked: (edgeId: string) => void
    onBoxHovered: (path: string | null) => void
    onBoxRightClicked: (path: string, clientX: number, clientY: number) => void
    onRendered: () => void
    /** The box painted on top at a layout point; an edge lying over it hands it the pointer. */
    boxAt: (point: Point) => string | null
}

type RenderSurface = ReturnType<echarts.ECharts["getZr"]>

interface ChartItemEvent {
    seriesId?: string
    name?: string
    data?: GraphDatum
    /** What the element under the pointer says about itself, when it is more than a part of its box. */
    info?: unknown
    event?: { event?: MouseEvent; offsetX: number; offsetY: number }
}

export const POINTER_LEAVE_GRACE_MS = 120
/** A click selects the box and so redraws the graph, which replaces the element under the pointer, and
 * ECharts then loses the second click of a double click. The browser's own double click still arrives on
 * the container, and it toggles the box the first click landed on. */
export const DOUBLE_CLICK_MS = 500

export class DependencyGraphHost {
    private chart?: echarts.ECharts
    private attachedContainer?: HTMLElement
    private pathUnderPointer: string | null = null
    private pointerLeaveTimeout?: ReturnType<typeof setTimeout>
    private lastBoxClick: { path: string; at: number } | null = null
    private dragGesture?: BoxDragGesture
    private chartSize?: Viewport
    private readonly panKey = new PanKey()

    private readonly containerSizeObserver = new ContainerSizeObserver()
    private readonly partClickHandlers: Record<string, (path: string) => void> = {
        [TOGGLE_INFO]: path => this.handlers.onBoxToggled(path),
        [CYCLE_BADGE_INFO]: path => this.handlers.onCycleBadgeClicked(path)
    }

    readonly containerSize = this.containerSizeObserver.size

    constructor(
        private readonly chartRegistry: DependencyGraphChartRegistry,
        private readonly handlers: DependencyGraphHandlers
    ) {}

    attachTo(container: HTMLElement): void {
        if (this.chart && this.attachedContainer === container) {
            return
        }
        this.dispose()
        this.attachedContainer = container
        this.chart = echarts.init(container)
        this.dragGesture = new BoxDragGesture(this.chart, {
            ...this.handlers,
            canDragBox: path => !this.panKey.isHeld && this.handlers.canDragBox(path)
        })
        this.listenToChart(this.chart)
        this.listenToRenderSurface(this.chart.getZr(), this.dragGesture)
        this.listenToContainer(container)
        this.chartRegistry.register(this.chart)
    }

    render(option: object): void {
        if (!this.chart) {
            return
        }
        this.attachedContainer?.setAttribute("aria-busy", "true")
        this.resizeToContainer(this.chart)
        this.chart.setOption(option as echarts.EChartsCoreOption)
    }

    /** The window the chart shows, carried over to `viewport` at the same scale; null before anything is drawn. */
    shownWindowFor(viewport: Viewport): AxisWindow | null {
        if (!this.chart || !this.chartSize) {
            return null
        }
        const shownWindow = windowResizedTo(this.shownWindow(this.chart, this.chartSize), this.chartSize, viewport)
        return [...shownWindow.x, ...shownWindow.y].every(Number.isFinite) ? shownWindow : null
    }

    dispose(): void {
        this.cancelPointerLeave()
        this.reportPointerLeft()
        this.attachedContainer?.removeEventListener("contextmenu", suppressBrowserMenu)
        this.attachedContainer?.removeEventListener("dblclick", this.reportDoubleClick)
        this.containerSizeObserver.disconnect()
        this.panKey.stopListening()
        this.dragGesture?.cancel()
        this.dragGesture = undefined
        if (this.chart) {
            this.chartRegistry.unregister(this.chart)
        }
        this.chart?.dispose()
        this.chart = undefined
        this.chartSize = undefined
        this.attachedContainer = undefined
    }

    private listenToChart(chart: echarts.ECharts): void {
        chart.on("mousedown", (event: unknown) => this.startDragging(event as ChartItemEvent))
        chart.on("click", (event: unknown) => this.reportClick(event as ChartItemEvent))
        chart.on("mouseover", (event: unknown) => this.reportPointerEntered(event as ChartItemEvent))
        chart.on("mouseout", () => this.reportPointerLeftAfterGrace())
        chart.on("contextmenu", (event: unknown) => this.reportRightClick(event as ChartItemEvent))
        chart.on("finished", () => this.reportRendered())
    }

    private listenToRenderSurface(renderSurface: RenderSurface, dragGesture: BoxDragGesture): void {
        // Redrawing replaces the boxes under a resting pointer, and ECharts then reports no mouseout for them.
        renderSurface.on("mousemove", event => {
            dragGesture.move(event)
            if (!event.target) {
                this.reportPointerOverNothing()
            }
        })
        renderSurface.on("mouseup", () => dragGesture.release())
        renderSurface.on("globalout", () => {
            dragGesture.release()
            this.reportPointerOverNothing()
        })
    }

    private listenToContainer(container: HTMLElement): void {
        container.addEventListener("contextmenu", suppressBrowserMenu)
        container.addEventListener("dblclick", this.reportDoubleClick)
        this.containerSizeObserver.observe(container)
        this.panKey.listenOver(container)
    }

    private shownWindow(chart: echarts.ECharts, { width, height }: Viewport): AxisWindow {
        const [left, top] = layoutPointAt(chart, { offsetX: 0, offsetY: 0 })
        const [right, bottom] = layoutPointAt(chart, { offsetX: width, offsetY: height })
        return { x: [left, right], y: [top, bottom] }
    }

    // ECharts' resize() redraws everything even when the size is unchanged.
    private resizeToContainer(chart: echarts.ECharts): void {
        const size = this.containerSize()
        if (size.width === this.chartSize?.width && size.height === this.chartSize?.height) {
            return
        }
        this.chartSize = size
        chart.resize()
    }

    private startDragging(event: ChartItemEvent): void {
        const path = this.boxUnder(event)
        if (path !== null && event.event) {
            this.dragGesture?.press(path, event.event)
        }
    }

    private reportClick(event: ChartItemEvent): void {
        if (this.dragGesture?.takeClickThatEndedDrag()) {
            return
        }
        if (event.data?.edgeId !== undefined) {
            this.letNoDoubleClickToggle()
            this.handlers.onEdgeClicked(event.data.edgeId)
            return
        }
        const path = this.boxUnder(event)
        if (path === null) {
            return
        }
        const onPartClicked = this.partClickHandlers[String(event.info)]
        if (onPartClicked) {
            this.letNoDoubleClickToggle()
            onPartClicked(path)
            return
        }
        this.lastBoxClick = { path, at: Date.now() }
        this.handlers.onBoxClicked(path)
    }

    private letNoDoubleClickToggle(): void {
        this.lastBoxClick = null
    }

    private readonly reportDoubleClick = (): void => {
        const click = this.lastBoxClick
        this.lastBoxClick = null
        if (click && Date.now() - click.at <= DOUBLE_CLICK_MS) {
            this.handlers.onBoxToggled(click.path)
        }
    }

    private reportRightClick(event: ChartItemEvent): void {
        const path = this.boxUnder(event)
        const mouseEvent = event.event?.event
        if (path !== null && mouseEvent) {
            this.handlers.onBoxRightClicked(path, mouseEvent.clientX, mouseEvent.clientY)
        }
    }

    private boxUnder(event: ChartItemEvent): string | null {
        if (event.data?.isEdge && event.event && this.chart) {
            return this.handlers.boxAt(layoutPointAt(this.chart, event.event))
        }
        return boxPathOf(event)
    }

    private reportRendered(): void {
        this.attachedContainer?.setAttribute("aria-busy", "false")
        this.handlers.onRendered()
    }

    private reportPointerEntered(event: ChartItemEvent): void {
        const path = this.boxUnder(event)
        if (path === null) {
            return
        }
        this.cancelPointerLeave()
        if (path !== this.pathUnderPointer) {
            this.pathUnderPointer = path
            this.handlers.onBoxHovered(path)
        }
    }

    // Moving from a box into the box nested in it leaves the first before entering the second; reporting
    // that gap would clear the hover for a frame and flash every edge.
    private reportPointerLeftAfterGrace(): void {
        this.cancelPointerLeave()
        this.pointerLeaveTimeout = setTimeout(() => {
            this.pointerLeaveTimeout = undefined
            this.reportPointerLeft()
        }, POINTER_LEAVE_GRACE_MS)
    }

    private reportPointerOverNothing(): void {
        if (this.pathUnderPointer !== null && this.pointerLeaveTimeout === undefined) {
            this.reportPointerLeftAfterGrace()
        }
    }

    private reportPointerLeft(): void {
        if (this.pathUnderPointer === null) {
            return
        }
        this.pathUnderPointer = null
        this.handlers.onBoxHovered(null)
    }

    private cancelPointerLeave(): void {
        if (this.pointerLeaveTimeout !== undefined) {
            clearTimeout(this.pointerLeaveTimeout)
            this.pointerLeaveTimeout = undefined
        }
    }
}

function boxPathOf({ seriesId, name, data }: ChartItemEvent): string | null {
    if (seriesId !== GRAPH_SERIES_ID) {
        return null
    }
    return data?.titledBoxPath || name || null
}
