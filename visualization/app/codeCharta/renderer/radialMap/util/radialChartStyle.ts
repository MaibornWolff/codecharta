export const CENTRE_RADIUS = 0.2
export const OUTER_RADIUS = 0.95
export const DIMMED_OPACITY = 0.45
export const TRANSITION_MS = 400
export const QUARTER_TURN = Math.PI / 2
export const FULL_TURN = 2 * Math.PI
export const WHITE = "#ffffff"
const HOVER_FADE = { duration: 500, easing: "cubicOut" }
const MOST_PIECES_TO_MOVE = 2000
const NO_MOVE = { animationDuration: 0, animationDurationUpdate: 0 }
// A border takes its width out of every piece it outlines, so on a piece thinner than a few borders the
// white line covers the colour. Thinner pieces are outlined in their own colour instead: canvas
// antialiasing leaves gaps between sub-pixel slivers, and a map of many tiny files would fade to white.
const ROOM_PER_BORDER_WIDTH = 4
const SLIVER_BLEED_PX = 1

interface PieceAnimation {
    animationThreshold: number
    stateAnimation: { duration: number; easing: string }
    animationDuration?: number
    animationDurationUpdate: number
}

export interface Border {
    color: string
    widthPx: number
}

// ECharts drops every animation of a series above its animation threshold, the hover fade with it, so on a big map
// the rest of the chart dimmed in one jump. Past the old threshold only the moves stay off, which reshape every piece.
export function pieceAnimation(pieceCount: number): PieceAnimation {
    const moves = pieceCount <= MOST_PIECES_TO_MOVE ? { animationDurationUpdate: TRANSITION_MS } : NO_MOVE
    return { animationThreshold: Number.POSITIVE_INFINITY, stateAnimation: HOVER_FADE, ...moves }
}

export function ringWidth(ringCount: number): number {
    return (OUTER_RADIUS - CENTRE_RADIUS) / ringCount
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
