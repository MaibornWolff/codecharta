import { signal } from "@angular/core"
import * as echarts from "echarts"
import "echarts-wordcloud"
import { WordCloudChartRegistry } from "../../services/wordCloudChart.registry"
import { WordCloudOption } from "../../util/wordCloudOption.model"

const RENDER_DEBOUNCE_MS = 150
const DRAWN_COUNT_SETTLE_MS = 200

interface EchartsWithModel {
    getModel?: () => {
        getSeriesByIndex: (
            index: number
        ) => { getData: () => { count: () => number; getItemGraphicEl: (index: number) => unknown } } | undefined
    }
}

export class WordCloudChartHost {
    private chart?: echarts.ECharts
    private resizeObserver?: ResizeObserver
    private renderTimeout?: ReturnType<typeof setTimeout>
    private drawnCountTimeout?: ReturnType<typeof setTimeout>

    private readonly measuredContainerSize = signal(
        { width: 0, height: 0 },
        { equal: (a, b) => a.width === b.width && a.height === b.height }
    )
    private readonly drawnWords = signal<number | null>(null)

    readonly containerSize = this.measuredContainerSize.asReadonly()
    readonly drawnWordCount = this.drawnWords.asReadonly()

    constructor(
        private readonly chartRegistry: WordCloudChartRegistry,
        private readonly onLayoutFinished: () => void
    ) {}

    attachTo(container: HTMLElement): void {
        if (this.chart) {
            return
        }
        this.chart = echarts.init(container)
        this.chart.on("finished", () => {
            this.onLayoutFinished()
            this.scheduleDrawnCountUpdate()
        })
        this.chartRegistry.register(this.chart)
        this.measuredContainerSize.set({ width: container.clientWidth, height: container.clientHeight })
        this.publishEveryMeasuredSize(container)
    }

    render(option: WordCloudOption): void {
        if (this.renderTimeout !== undefined) {
            clearTimeout(this.renderTimeout)
        }
        this.renderTimeout = setTimeout(() => {
            this.renderTimeout = undefined
            this.drawnWords.set(null)
            this.chart?.clear()
            this.chart?.resize()
            this.chart?.setOption(option as unknown as echarts.EChartsCoreOption, true)
        }, RENDER_DEBOUNCE_MS)
    }

    dispose(): void {
        this.resizeObserver?.disconnect()
        this.resizeObserver = undefined
        if (this.renderTimeout !== undefined) {
            clearTimeout(this.renderTimeout)
        }
        if (this.drawnCountTimeout !== undefined) {
            clearTimeout(this.drawnCountTimeout)
        }
        this.drawnWords.set(null)
        if (this.chart) {
            this.chartRegistry.unregister(this.chart)
        }
        this.chart?.dispose()
        this.chart = undefined
    }

    private publishEveryMeasuredSize(container: HTMLElement): void {
        this.resizeObserver = new ResizeObserver(() => {
            this.measuredContainerSize.set({ width: container.clientWidth, height: container.clientHeight })
        })
        this.resizeObserver.observe(container)
    }

    private scheduleDrawnCountUpdate(): void {
        if (this.drawnCountTimeout !== undefined) {
            clearTimeout(this.drawnCountTimeout)
        }
        this.drawnCountTimeout = setTimeout(() => {
            this.drawnCountTimeout = undefined
            this.drawnWords.set(this.countWordsWithAGraphicElement())
        }, DRAWN_COUNT_SETTLE_MS)
    }

    private countWordsWithAGraphicElement(): number | null {
        const data = (this.chart as unknown as EchartsWithModel | undefined)?.getModel?.()?.getSeriesByIndex(0)?.getData()
        if (!data) {
            return null
        }
        let drawnCount = 0
        for (let index = 0; index < data.count(); index++) {
            if (data.getItemGraphicEl(index)) {
                drawnCount++
            }
        }
        return drawnCount
    }
}
