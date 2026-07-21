import { InjectionToken } from "@angular/core"
import { ExplorerRowProjection } from "../../lenses/explorerRow/explorerRowLens.facade"
import { CodeMapNode } from "../../model/codeCharta.model"

/**
 * Per-view row presentation: projects a node into how the explorer renders its row (selectable, dimmed,
 * italic, hover hint, trailing decoration). Each view feeds the pure `projectExplorerRow` lens whatever
 * facts it has — the metrics view its 3D-map state, the domain view nothing — so no map semantics leak
 * into the explorer. Implementations read signals, so callers wrap them in `computed()` and stay reactive.
 */
export interface ExplorerRow {
    project(node: CodeMapNode): ExplorerRowProjection
}

export const EXPLORER_ROW = new InjectionToken<ExplorerRow>("EXPLORER_ROW")
