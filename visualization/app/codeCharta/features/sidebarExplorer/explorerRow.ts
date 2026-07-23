import { InjectionToken } from "@angular/core"
import { ExplorerRowProjection } from "../../lenses/explorerRow/explorerRowLens.facade"
import { CodeMapNode } from "../../model/codeCharta.model"

export interface ExplorerRow {
    project(node: CodeMapNode): ExplorerRowProjection
}

export const EXPLORER_ROW = new InjectionToken<ExplorerRow>("EXPLORER_ROW")
