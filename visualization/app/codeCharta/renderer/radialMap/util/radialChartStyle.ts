export const CENTRE_RADIUS = 0.2
export const OUTER_RADIUS = 0.95
export const DIMMED_OPACITY = 0.45
export const TRANSITION_MS = 400
// A border takes its width out of every piece it outlines, so on a piece thinner than a few borders the
// white line covers the colour. Thinner pieces are outlined in their own colour instead: canvas
// antialiasing leaves gaps between sub-pixel slivers, and a map of many tiny files would fade to white.
const ROOM_PER_BORDER_WIDTH = 4
const SLIVER_BLEED_PX = 1

export interface Border {
    color: string
    widthPx: number
}

export function borderWidthThatFits(borderWidthPx: number, thinnestSidePx: number): number {
    return fitsBorder(borderWidthPx, thinnestSidePx) ? borderWidthPx : 0
}

export function pieceBorder(fillColor: string, border: Border, thinnestSidePx: number): Border {
    return fitsBorder(border.widthPx, thinnestSidePx) ? border : { color: fillColor, widthPx: SLIVER_BLEED_PX }
}

function fitsBorder(borderWidthPx: number, thinnestSidePx: number): boolean {
    return thinnestSidePx >= borderWidthPx * ROOM_PER_BORDER_WIDTH
}
