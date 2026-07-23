import { InjectionToken } from "@angular/core"
import { CodeMapNode } from "../../model/codeCharta.model"

export interface ExplorerContextMenu {
    isEnabledFor(node: CodeMapNode): boolean
    isMarked(node: CodeMapNode): boolean

    open(node: CodeMapNode, xPosition: number, yPosition: number): void
    close(): void
}

export const EXPLORER_CONTEXT_MENU = new InjectionToken<ExplorerContextMenu>("EXPLORER_CONTEXT_MENU")
