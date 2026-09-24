import { Border, WHITE } from "./radialChartStyle"
import { buildRadialPiecesOption } from "./radialPiecesOption"
import { RadialOptionInputs, RadialShape } from "./radialShape"
import { layOutRadialTreemap } from "./radialTreemapLayout"

const PIECE_BORDER: Border = { color: WHITE, widthPx: 0.5 }

// The last band shows its folders' contents as a treemap, so the map draws one level deeper than it has bands.
export function radialTreemapShape(maxBandCount: number): RadialShape {
    return { visibleDepth: maxBandCount + 1, buildOption: inputs => buildRadialTreemapOption(inputs, maxBandCount) }
}

export function buildRadialTreemapOption(inputs: RadialOptionInputs, maxBandCount: number) {
    return buildRadialPiecesOption(inputs, layOutRadialTreemap(inputs.centre, maxBandCount), PIECE_BORDER)
}
