import { computed, Injectable, signal } from "@angular/core"

/**
 * The slice of the ECharts instance anything outside the renderer is allowed to touch. Keeping it this
 * narrow means consumers (the screenshot capture) never depend on the echarts types, and the renderer
 * stays free to swap the charting library.
 */
export interface WordCloudChartHandle {
    getRenderedCanvas(options: { pixelRatio: number; backgroundColor: string }): HTMLCanvasElement
}

/**
 * Holds the live word-cloud chart so features outside the renderer can read its canvas — the same role
 * ThreeRendererService plays for the 3D map. The cloud registers its chart when it is created and
 * withdraws it when the empty state replaces it, so `hasChart` also answers "is there anything to capture".
 */
@Injectable({ providedIn: "root" })
export class WordCloudChartRegistry {
    private readonly chart = signal<WordCloudChartHandle | null>(null)

    readonly hasChart = computed(() => this.chart() !== null)

    register(chart: WordCloudChartHandle): void {
        this.chart.set(chart)
    }

    /** Only the registered chart may withdraw itself, so a stale teardown cannot unregister a newer chart. */
    unregister(chart: WordCloudChartHandle): void {
        if (this.chart() === chart) {
            this.chart.set(null)
        }
    }

    current(): WordCloudChartHandle | null {
        return this.chart()
    }
}
