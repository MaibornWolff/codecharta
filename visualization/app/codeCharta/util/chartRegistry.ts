import { computed, signal } from "@angular/core"

export interface ChartHandle {
    getRenderedCanvas(options: { pixelRatio: number; backgroundColor: string }): HTMLCanvasElement
}

export class ChartRegistry {
    private readonly chart = signal<ChartHandle | null>(null)

    readonly hasChart = computed(() => this.chart() !== null)

    register(chart: ChartHandle): void {
        this.chart.set(chart)
    }

    unregister(chart: ChartHandle): void {
        if (this.chart() === chart) {
            this.chart.set(null)
        }
    }

    current(): ChartHandle | null {
        return this.chart()
    }
}
