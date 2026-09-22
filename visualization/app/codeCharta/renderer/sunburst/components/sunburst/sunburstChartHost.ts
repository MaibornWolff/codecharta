import { signal } from "@angular/core"
import { SunburstChart } from "echarts/charts"
import { AriaComponent, TooltipComponent } from "echarts/components"
import * as echarts from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import { SunburstChartRegistry } from "../../services/sunburstChart.registry"
import { SunburstDatum, SunburstOption } from "../../util/sunburstOption.builder"

echarts.use([SunburstChart, CanvasRenderer, TooltipComponent, AriaComponent])

export interface SunburstChartHandlers {
    onFolderClicked: (path: string) => void
    onFileClicked: (path: string) => void
    onCentreClicked: () => void
    onNodeHovered: (path: string | null) => void
}

interface EchartsSegmentEvent {
    data?: SunburstDatum
}

export class SunburstChartHost {
    private chart?: echarts.ECharts
    private attachedContainer?: HTMLElement
    private resizeObserver?: ResizeObserver
    private highlightedPath: string | null = null

    private readonly measuredContainerSize = signal(
        { width: 0, height: 0 },
        { equal: (a, b) => a.width === b.width && a.height === b.height }
    )

    readonly containerSize = this.measuredContainerSize.asReadonly()

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
        this.chart.on("mouseover", (event: unknown) => this.handlers.onNodeHovered((event as EchartsSegmentEvent).data?.name ?? null))
        this.chart.on("mouseout", () => this.handlers.onNodeHovered(null))
        this.chartRegistry.register(this.chart)
        this.measureContainer()
        this.resizeObserver = new ResizeObserver(() => this.measureContainer())
        this.resizeObserver.observe(container)
    }

    render(option: SunburstOption): void {
        if (!this.chart) {
            return
        }
        this.chart.resize()
        this.chart.setOption(option as unknown as echarts.EChartsCoreOption)
        this.applyHighlight()
    }

    highlight(path: string | null): void {
        this.highlightedPath = path
        this.applyHighlight()
    }

    dispose(): void {
        this.resizeObserver?.disconnect()
        this.resizeObserver = undefined
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

    private applyHighlight(): void {
        if (!this.chart) {
            return
        }
        this.chart.dispatchAction({ type: "downplay", seriesIndex: 0 })
        if (this.highlightedPath !== null) {
            this.chart.dispatchAction({ type: "highlight", seriesIndex: 0, name: this.highlightedPath })
        }
    }

    private measureContainer(): void {
        if (this.attachedContainer) {
            this.measuredContainerSize.set({ width: this.attachedContainer.clientWidth, height: this.attachedContainer.clientHeight })
        }
    }
}
