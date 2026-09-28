import { CustomChart } from "echarts/charts"
import { AriaComponent, DataZoomInsideComponent, GridComponent, TooltipComponent } from "echarts/components"
import * as echarts from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import { ContainerSizeObserver } from "../../../../util/containerSizeObserver"
import { suppressBrowserMenu } from "../../../../util/suppressBrowserMenu"
import { isBoxSeries } from "../../util/dependencyGraphSeries"

echarts.use([CustomChart, CanvasRenderer, GridComponent, DataZoomInsideComponent, TooltipComponent, AriaComponent])

export interface DependencyGraphHandlers {
    onBoxClicked: (path: string) => void
    onBoxToggled: (path: string) => void
    onBoxHovered: (path: string | null) => void
    onBoxRightClicked: (path: string, clientX: number, clientY: number) => void
    onRendered: () => void
}

interface ChartItemEvent {
    seriesId?: string
    name?: string
    event?: { event?: MouseEvent }
}

export const POINTER_LEAVE_GRACE_MS = 120
/** A click selects the box and so redraws the graph, which replaces the element under the pointer, and
 * ECharts then loses the second click of a double click. The browser's own double click still arrives on
 * the container, and it toggles the box the first click landed on. */
export const DOUBLE_CLICK_MS = 500
const WHOLE_RANGE = { start: 0, end: 100 }

export class DependencyGraphHost {
    private chart?: echarts.ECharts
    private attachedContainer?: HTMLElement
    private pathUnderPointer: string | null = null
    private pointerLeaveTimeout?: ReturnType<typeof setTimeout>
    private lastBoxClick: { path: string; at: number } | null = null

    private readonly containerSizeObserver = new ContainerSizeObserver()

    readonly containerSize = this.containerSizeObserver.size

    constructor(private readonly handlers: DependencyGraphHandlers) {}

    attachTo(container: HTMLElement): void {
        if (this.chart && this.attachedContainer === container) {
            return
        }
        this.dispose()
        this.attachedContainer = container
        this.chart = echarts.init(container)
        this.chart.on("click", (event: unknown) => this.reportClick(event as ChartItemEvent))
        this.chart.on("mouseover", (event: unknown) => this.reportPointerEntered(event as ChartItemEvent))
        this.chart.on("mouseout", () => this.reportPointerLeftAfterGrace())
        this.chart.on("contextmenu", (event: unknown) => this.reportRightClick(event as ChartItemEvent))
        this.chart.on("finished", () => this.reportRendered())
        // Redrawing replaces the boxes under a resting pointer, and ECharts then reports no mouseout for them.
        const renderSurface = this.chart.getZr()
        renderSurface.on("mousemove", event => {
            if (!event.target) {
                this.reportPointerOverNothing()
            }
        })
        renderSurface.on("globalout", () => this.reportPointerOverNothing())
        container.addEventListener("contextmenu", suppressBrowserMenu)
        container.addEventListener("dblclick", this.reportDoubleClick)
        this.containerSizeObserver.observe(container)
    }

    render(option: object): void {
        if (!this.chart) {
            return
        }
        this.attachedContainer?.setAttribute("aria-busy", "true")
        this.chart.resize()
        this.chart.setOption(option as echarts.EChartsCoreOption)
    }

    resetView(): void {
        this.chart?.dispatchAction({
            type: "dataZoom",
            batch: [
                { dataZoomIndex: 0, ...WHOLE_RANGE },
                { dataZoomIndex: 1, ...WHOLE_RANGE }
            ]
        })
    }

    dispose(): void {
        this.cancelPointerLeave()
        this.reportPointerLeft()
        this.attachedContainer?.removeEventListener("contextmenu", suppressBrowserMenu)
        this.attachedContainer?.removeEventListener("dblclick", this.reportDoubleClick)
        this.containerSizeObserver.disconnect()
        this.chart?.dispose()
        this.chart = undefined
        this.attachedContainer = undefined
    }

    private reportClick(event: ChartItemEvent): void {
        const path = boxPathOf(event)
        if (path === null) {
            return
        }
        this.lastBoxClick = { path, at: Date.now() }
        this.handlers.onBoxClicked(path)
    }

    private readonly reportDoubleClick = (): void => {
        const click = this.lastBoxClick
        this.lastBoxClick = null
        if (click && Date.now() - click.at <= DOUBLE_CLICK_MS) {
            this.handlers.onBoxToggled(click.path)
        }
    }

    private reportRightClick(event: ChartItemEvent): void {
        const path = boxPathOf(event)
        const mouseEvent = event.event?.event
        if (path !== null && mouseEvent) {
            this.handlers.onBoxRightClicked(path, mouseEvent.clientX, mouseEvent.clientY)
        }
    }

    private reportRendered(): void {
        this.attachedContainer?.setAttribute("aria-busy", "false")
        this.handlers.onRendered()
    }

    private reportPointerEntered(event: ChartItemEvent): void {
        const path = boxPathOf(event)
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

function boxPathOf({ seriesId, name }: ChartItemEvent): string | null {
    return isBoxSeries(seriesId) && name ? name : null
}
