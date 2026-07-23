import { Injectable } from "@angular/core"
import { ExplorerRow } from "../../../features/sidebarExplorer/facade"
import { ExplorerRowProjection, projectExplorerRow } from "../../../lenses/explorerRow/explorerRowLens.facade"
import { CodeMapNode } from "../../../model/codeCharta.model"

@Injectable()
export class DomainExplorerRow implements ExplorerRow {
    project(node: CodeMapNode): ExplorerRowProjection {
        return projectExplorerRow(node, {})
    }
}
