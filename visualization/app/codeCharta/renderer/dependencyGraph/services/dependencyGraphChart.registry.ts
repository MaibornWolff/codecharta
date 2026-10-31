import { Injectable } from "@angular/core"
import { ChartRegistry } from "../../../util/chartRegistry"
import { Rectangle } from "../util/geometry"

/** What a screenshot of a single box needs from the graph on screen. */
export interface BoxShots {
    /** The part of a path's box in view, in pixels on the chart; null while it has no box of its own or none of it is in view. */
    pixelRectOf(path: string): Rectangle | null
    /** The graph as shown, but with only the edges inside the box; null while nothing is drawn. */
    renderWithEdgesWithin(path: string, pixelRatio: number): HTMLCanvasElement | null
}

const NO_BOX_SHOTS: BoxShots = { pixelRectOf: () => null, renderWithEdgesWithin: () => null }

@Injectable({ providedIn: "root" })
export class DependencyGraphChartRegistry extends ChartRegistry {
    private boxShotSource = NO_BOX_SHOTS

    provideBoxShots(boxShots: BoxShots): void {
        this.boxShotSource = boxShots
    }

    withdrawBoxShots(boxShots: BoxShots): void {
        if (this.boxShotSource === boxShots) {
            this.boxShotSource = NO_BOX_SHOTS
        }
    }

    get boxShots(): BoxShots {
        return this.boxShotSource
    }
}
