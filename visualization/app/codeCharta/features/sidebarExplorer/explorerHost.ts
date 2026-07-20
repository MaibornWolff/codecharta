import { InjectionToken } from "@angular/core"
import { CodeMapNode } from "../../model/codeCharta.model"

/**
 * What the explorer renders for a row beyond its name: the trailing column and the muted/italic
 * treatment. `title` is the row's native hover hint ("" for none).
 */
export interface ExplorerRowState {
    isDimmed: boolean
    isItalic: boolean
    title: string
}

/** Which optional chrome the hosting view wants. The tree, header and sort control are always on. */
export interface ExplorerHostCapabilities {
    showRules: boolean
    showSearch: boolean
    showCounts: boolean
}

/**
 * The contract between the explorer and the view that mounts it.
 *
 * The explorer owns the tree: rendering, search, sort, collapse, resize and reveal. What a row MEANS —
 * whether it can be selected, what hovering it shows, what a right-click offers — belongs to the view,
 * because those answers differ per view and only the view knows them. The metrics view answers them with
 * the 3D map (select a building, show the area/height/color metrics); the domain view answers them with
 * the word bank. Neither concern may leak back into the explorer.
 *
 * Implementations read signals, so callers can wrap them in `computed()` and stay reactive.
 */
export interface ExplorerHost {
    readonly capabilities: ExplorerHostCapabilities

    /** Rows that cannot be selected ignore clicks and are rendered as inert. */
    isSelectable(node: CodeMapNode): boolean

    rowState(node: CodeMapNode): ExplorerRowState

    /** Trailing column text for the row, or null to render no trailing column. */
    rowDecoration(node: CodeMapNode): string | null

    /** False suppresses the context menu entirely — no handler, no marker, no scroll listener. */
    hasContextMenu(node: CodeMapNode): boolean

    /** `rowRect` is the row's bounding box, so the view can anchor a tooltip to it. */
    onHover(node: CodeMapNode, rowRect: DOMRect): void
    onHoverEnd(): void

    /** Called after the explorer has already published the selection by path. */
    onSelect(node: CodeMapNode): void
    onDeselect(): void
}

export const EXPLORER_HOST = new InjectionToken<ExplorerHost>("EXPLORER_HOST")
