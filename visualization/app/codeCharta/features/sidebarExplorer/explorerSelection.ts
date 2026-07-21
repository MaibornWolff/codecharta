import { InjectionToken } from "@angular/core"
import { CodeMapNode } from "../../model/codeCharta.model"

/**
 * What selecting or hovering an explorer row MEANS in the hosting view — the answer differs per view and
 * only the view knows it. The metrics view answers with the 3D map (select a building, show the metric
 * tooltip, light the hovered row); the domain view answers with the word bank (drive the cloud, preview
 * the top words). Every method is genuinely implemented by both views — there are no no-ops.
 *
 * `isSelected`/`isHovered` read signals, so callers wrap them in `computed()` and stay reactive.
 */
export interface ExplorerSelection {
    isSelected(node: CodeMapNode): boolean
    isHovered(node: CodeMapNode): boolean

    select(node: CodeMapNode): void
    deselect(): void

    /** `rowRect` is the row's bounding box, so the view can anchor a tooltip to it. */
    hover(node: CodeMapNode, rowRect: DOMRect): void
    hoverEnd(): void
}

export const EXPLORER_SELECTION = new InjectionToken<ExplorerSelection>("EXPLORER_SELECTION")
