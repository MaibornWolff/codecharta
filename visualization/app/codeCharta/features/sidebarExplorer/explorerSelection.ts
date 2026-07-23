import { InjectionToken } from "@angular/core"
import { CodeMapNode } from "../../model/codeCharta.model"

export interface ExplorerSelection {
    isSelected(node: CodeMapNode): boolean
    isHovered(node: CodeMapNode): boolean

    select(node: CodeMapNode): void
    deselect(): void

    readonly clearsSelectionOnCollapse?: boolean

    hover(node: CodeMapNode, rowRect: DOMRect): void
    hoverEnd(): void
}

export const EXPLORER_SELECTION = new InjectionToken<ExplorerSelection>("EXPLORER_SELECTION")
