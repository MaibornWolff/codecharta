import { RadialColoring } from "./radialColor"
import { RadialMetrics, RadialNode } from "./radialTree"

export interface RadialOptionInputs {
    centre: RadialNode
    isMapRoot: boolean
    metrics: RadialMetrics
    coloring: RadialColoring
    chartSizeInPixels: number
}

export interface RadialShape {
    visibleDepth: number
    buildOption(inputs: RadialOptionInputs): object
}
