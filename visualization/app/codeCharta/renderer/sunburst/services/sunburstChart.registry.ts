import { computed, Injectable, signal } from "@angular/core"

export interface SunburstChartHandle {
    getRenderedCanvas(options: { pixelRatio: number; backgroundColor: string }): HTMLCanvasElement
}

@Injectable({ providedIn: "root" })
export class SunburstChartRegistry {
    private readonly chart = signal<SunburstChartHandle | null>(null)

    readonly hasChart = computed(() => this.chart() !== null)

    register(chart: SunburstChartHandle): void {
        this.chart.set(chart)
    }

    unregister(chart: SunburstChartHandle): void {
        if (this.chart() === chart) {
            this.chart.set(null)
        }
    }

    current(): SunburstChartHandle | null {
        return this.chart()
    }
}
