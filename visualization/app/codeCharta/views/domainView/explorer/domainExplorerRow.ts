import { Injectable } from "@angular/core"
import { ExplorerRow } from "../../../features/sidebarExplorer/facade"
import { ExplorerRowProjection, projectExplorerRow } from "../../../lenses/explorerRow/explorerRowLens.facade"
import { CodeMapNode } from "../../../model/codeCharta.model"

/**
 * How a row looks in the domain view: there is no 3D map, so the row lens is fed nothing. Every row is
 * selectable, nothing is dimmed and no decoration is drawn — the trivial projection. This is why a
 * `#/domain` deep link, where no buildings were ever registered, no longer leaves every file row inert.
 */
@Injectable()
export class DomainExplorerRow implements ExplorerRow {
    project(node: CodeMapNode): ExplorerRowProjection {
        return projectExplorerRow(node, {})
    }
}
