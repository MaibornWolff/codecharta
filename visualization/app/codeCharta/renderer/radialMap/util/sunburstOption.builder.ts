import { Border, WHITE } from "./radialChartStyle"
import { buildRadialPiecesOption } from "./radialPiecesOption"
import { RadialOptionInputs, RadialShape } from "./radialShape"
import { layOutSunburst } from "./sunburstLayout"

const SEGMENT_BORDER: Border = { color: WHITE, widthPx: 1 }

export function sunburstShape(maxRingCount: number): RadialShape {
    return { visibleDepth: maxRingCount, buildOption: inputs => buildSunburstOption(inputs, maxRingCount) }
}

export function buildSunburstOption(inputs: RadialOptionInputs, maxRingCount: number) {
    const placements = layOutSunburst(inputs.centre, maxRingCount)
    return buildRadialPiecesOption(inputs, placements, { border: SEGMENT_BORDER, focus: "ancestors" })
}
