/** The explorer on the left and the inspector on the right are as wide by default and may be dragged as far. */
export const SIDE_PANEL_WIDTH_PX = { min: 240, max: 720, default: 320 }

export function clampToSidePanelWidth(width: number): number {
    return Math.min(SIDE_PANEL_WIDTH_PX.max, Math.max(SIDE_PANEL_WIDTH_PX.min, width))
}
