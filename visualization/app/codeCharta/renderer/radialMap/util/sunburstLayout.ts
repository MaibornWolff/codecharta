import { CENTRE_RADIUS, ringWidth } from "./radialChartStyle"
import { AngularSpan, CENTRE_SECTOR, FULL_CIRCLE, largestFirst, RadialPlacement } from "./radialPlacement"
import { levelsBelow, RadialNode } from "./radialTree"

interface Rings {
    count: number
    width: number
}

export function layOutSunburst(centre: RadialNode, maxRingCount: number): RadialPlacement[] {
    const count = Math.max(1, levelsBelow(centre, maxRingCount))
    const placements: RadialPlacement[] = [{ node: centre, isCentre: true, sectors: [CENTRE_SECTOR] }]
    placeChildren(placements, { count, width: ringWidth(count) }, centre, FULL_CIRCLE, 1)
    return placements
}

function placeChildren(placements: RadialPlacement[], rings: Rings, parent: RadialNode, span: AngularSpan, ring: number) {
    if (ring > rings.count) {
        return
    }
    const anglePerArea = (span.endAngle - span.startAngle) / parent.area
    const innerRadius = CENTRE_RADIUS + (ring - 1) * rings.width
    let startAngle = span.startAngle
    for (const child of largestFirst(parent.children)) {
        const share = { startAngle, endAngle: startAngle + child.area * anglePerArea }
        placements.push({
            node: child,
            isCentre: false,
            sectors: [{ role: "ring", ...share, innerRadius, outerRadius: innerRadius + rings.width }]
        })
        placeChildren(placements, rings, child, share, ring + 1)
        startAngle = share.endAngle
    }
}
