import { signal } from "@angular/core"
import { AriaComponent, TooltipComponent } from "echarts/components"
// Only the pieces the cloud actually draws. The `echarts` barrel pulls every chart type it ships
// (sankey, gauge, radar, …) into the bundle; echarts-wordcloud registers against the core itself.
import * as echarts from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import "echarts-wordcloud"

echarts.use([CanvasRenderer, TooltipComponent, AriaComponent])

import { WordCloudChartRegistry } from "../../services/wordCloudChart.registry"
import { WordCloudOption } from "../../util/wordCloudOption.model"

const RENDER_DEBOUNCE_MS = 150
const DRAWN_COUNT_SETTLE_MS = 200

export interface WordCloudChartHandlers {
    onLayoutFinished: () => void
    onWordRightClicked: (word: string, clientX: number, clientY: number) => void
}

interface EchartsContextMenuParams {
    name?: string
    event?: { event?: MouseEvent }
}

function suppressBrowserMenu(event: Event): void {
    event.preventDefault()
}

interface EchartsWithModel {
    getModel?: () => {
        getSeriesByIndex: (
            index: number
        ) => { getData: () => { count: () => number; getItemGraphicEl: (index: number) => unknown } } | undefined
    }
}

export class WordCloudChartHost {
    private chart?: echarts.ECharts
    private attachedContainer?: HTMLElement
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
        private readonly handlers: WordCloudChartHandlers
    ) {}

    /** The empty state destroys the container element, so the one handed in on the way back is a new
     * element. A chart kept on the replaced one would keep drawing where nobody can see it. */
    attachTo(container: HTMLElement): void {
        if (this.chart && this.attachedContainer === container) {
            return
        }
        this.dispose()
        this.attachedContainer = container
        this.chart = echarts.init(container)
        this.chart.on("finished", () => {
            this.handlers.onLayoutFinished()
            this.scheduleDrawnCountUpdate()
        })
        this.chart.on("contextmenu", (params: unknown) => this.reportRightClickedWord(params as EchartsContextMenuParams))
        container.addEventListener("contextmenu", suppressBrowserMenu)
        this.chartRegistry.register(this.chart)
        this.measuredContainerSize.set({ width: container.clientWidth, height: container.clientHeight })
        this.publishEveryMeasuredSize(container)
    }

    /** Echarts reports the right click on the word, the browser its own menu on the canvas below it. */
    private reportRightClickedWord({ name, event }: EchartsContextMenuParams): void {
        const nativeEvent = event?.event
        if (!name || !nativeEvent) {
            return
        }
        this.handlers.onWordRightClicked(name, nativeEvent.clientX, nativeEvent.clientY)
    }

    /** `onRendered` runs only when the layout actually reaches the chart. The caller uses it to record
     * what is on the canvas, which a queued render must never claim on its behalf: the view can be left
     * inside the debounce window, and a render that never happened would otherwise be skipped forever. */
    render(option: WordCloudOption, onRendered: () => void): void {
        this.cancelPendingRender()
        this.renderTimeout = setTimeout(() => {
            this.renderTimeout = undefined
            if (!this.hasMeasurableContainer()) {
                return
            }
            this.drawnWords.set(null)
            this.chart?.clear()
            this.chart?.resize()
            this.chart?.setOption(option as unknown as echarts.EChartsCoreOption, true)
            onRendered()
        }, RENDER_DEBOUNCE_MS)
    }

    cancelPendingRender(): void {
        if (this.renderTimeout !== undefined) {
            clearTimeout(this.renderTimeout)
            this.renderTimeout = undefined
        }
    }

    private hasMeasurableContainer(): boolean {
        return this.attachedContainer !== undefined && this.attachedContainer.clientWidth > 0 && this.attachedContainer.clientHeight > 0
    }

    dispose(): void {
        this.attachedContainer?.removeEventListener("contextmenu", suppressBrowserMenu)
        this.resizeObserver?.disconnect()
        this.resizeObserver = undefined
        this.cancelPendingRender()
        if (this.drawnCountTimeout !== undefined) {
            clearTimeout(this.drawnCountTimeout)
        }
        this.drawnWords.set(null)
        if (this.chart) {
            this.chartRegistry.unregister(this.chart)
        }
        this.chart?.dispose()
        this.chart = undefined
        this.attachedContainer = undefined
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
