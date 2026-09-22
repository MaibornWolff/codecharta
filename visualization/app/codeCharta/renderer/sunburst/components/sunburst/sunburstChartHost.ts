import { SunburstChart } from "echarts/charts"
import { AriaComponent, TooltipComponent } from "echarts/components"
import * as echarts from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import { ContainerSizeObserver } from "../../../../util/containerSizeObserver"
import { suppressBrowserMenu } from "../../../../util/suppressBrowserMenu"
import { SunburstChartRegistry } from "../../services/sunburstChart.registry"
import { SunburstDatum, SunburstOption } from "../../util/sunburstOption.builder"

echarts.use([SunburstChart, CanvasRenderer, TooltipComponent, AriaComponent])

export interface SunburstChartHandlers {
    onFolderClicked: (path: string) => void
    onFileClicked: (path: string) => void
    onCentreClicked: () => void
    onNodeHovered: (path: string | null) => void
    onNodeRightClicked: (path: string, clientX: number, clientY: number) => void
}

interface EchartsSegmentEvent {
    data?: SunburstDatum
    event?: { event?: MouseEvent }
}

export const POINTER_LEAVE_GRACE_MS = 120

export class SunburstChartHost {
    private chart?: echarts.ECharts
    private attachedContainer?: HTMLElement
    private highlightedPath: string | null = null
    private pathUnderPointer: string | null = null
    private pointerLeaveTimeout?: ReturnType<typeof setTimeout>

    private readonly containerSizeObserver = new ContainerSizeObserver()

    readonly containerSize = this.containerSizeObserver.size

    constructor(
        private readonly chartRegistry: SunburstChartRegistry,
        private readonly handlers: SunburstChartHandlers
    ) {}

    attachTo(container: HTMLElement): void {
        if (this.chart && this.attachedContainer === container) {
            return
        }
        this.dispose()
        this.attachedContainer = container
        this.chart = echarts.init(container)
        this.chart.on("click", (event: unknown) => this.reportClick(event as EchartsSegmentEvent))
        this.chart.on("mouseover", (event: unknown) => this.reportPointerEntered((event as EchartsSegmentEvent).data?.name ?? null))
        this.chart.on("mouseout", () => this.reportPointerLeftAfterGrace())
        this.chart.on("contextmenu", (event: unknown) => this.reportRightClick(event as EchartsSegmentEvent))
        this.chart.on("finished", () => container.setAttribute("aria-busy", "false"))
        container.addEventListener("contextmenu", suppressBrowserMenu)
        this.chartRegistry.register(this.chart)
        this.containerSizeObserver.observe(container)
    }

    render(option: SunburstOption): void {
        if (!this.chart) {
            return
        }
        this.attachedContainer.setAttribute("aria-busy", "true")
        this.chart.resize()
        this.chart.setOption(option as unknown as echarts.EChartsCoreOption)
        this.pathUnderPointer = null
        this.applyHighlight()
    }

    highlight(path: string | null): void {
        this.highlightedPath = path
        if (path !== null && path === this.pathUnderPointer) {
            return
        }
        this.applyHighlight()
    }

    dispose(): void {
        this.cancelPointerLeave()
        this.attachedContainer?.removeEventListener("contextmenu", suppressBrowserMenu)
        this.containerSizeObserver.disconnect()
        if (this.chart) {
            this.chartRegistry.unregister(this.chart)
            this.chart.dispose()
        }
        this.chart = undefined
        this.attachedContainer = undefined
    }

    private reportClick({ data }: EchartsSegmentEvent): void {
        if (!data) {
            return
        }
        if (data.isCentre) {
            this.handlers.onCentreClicked()
        } else if (data.isFile) {
            this.handlers.onFileClicked(data.name)
        } else {
            this.handlers.onFolderClicked(data.name)
        }
    }

    private reportPointerEntered(path: string | null): void {
        this.cancelPointerLeave()
        this.pathUnderPointer = path
        this.handlers.onNodeHovered(path)
    }

    // Moving from one segment to the next leaves the first before entering the second; reporting that
    // gap would drop the hover everywhere for a frame and make the whole chart flash.
    private reportPointerLeftAfterGrace(): void {
        this.cancelPointerLeave()
        this.pointerLeaveTimeout = setTimeout(() => {
            this.pointerLeaveTimeout = undefined
            this.pathUnderPointer = null
            this.handlers.onNodeHovered(null)
        }, POINTER_LEAVE_GRACE_MS)
    }

    private cancelPointerLeave(): void {
        if (this.pointerLeaveTimeout !== undefined) {
            clearTimeout(this.pointerLeaveTimeout)
            this.pointerLeaveTimeout = undefined
        }
    }

    private reportRightClick({ data, event }: EchartsSegmentEvent): void {
        const mouseEvent = event?.event
        if (data && mouseEvent) {
            this.handlers.onNodeRightClicked(data.name, mouseEvent.clientX, mouseEvent.clientY)
        }
    }

    private applyHighlight(): void {
        if (!this.chart) {
            return
        }
        this.chart.dispatchAction({ type: "downplay", seriesIndex: 0 })
        if (this.highlightedPath !== null) {
            this.chart.dispatchAction({ type: "highlight", seriesIndex: 0, name: this.highlightedPath })
        }
    }
}
