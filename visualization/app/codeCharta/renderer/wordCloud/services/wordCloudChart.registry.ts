import { computed, Injectable, signal } from "@angular/core"

export interface WordCloudChartHandle {
    getRenderedCanvas(options: { pixelRatio: number; backgroundColor: string }): HTMLCanvasElement
}

@Injectable({ providedIn: "root" })
export class WordCloudChartRegistry {
    private readonly chart = signal<WordCloudChartHandle | null>(null)

    readonly hasChart = computed(() => this.chart() !== null)

    register(chart: WordCloudChartHandle): void {
        this.chart.set(chart)
    }

    unregister(chart: WordCloudChartHandle): void {
        if (this.chart() === chart) {
            this.chart.set(null)
        }
    }

    current(): WordCloudChartHandle | null {
        return this.chart()
    }
}
