import { Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { ExplorerRow } from "../../../features/sidebarExplorer/facade"
import { ExplorerRowProjection, projectExplorerRow } from "../../../lenses/explorerRow/explorerRowLens.facade"
import { CodeMapNode } from "../../../model/codeCharta.model"
import { rootUnarySelector } from "../../../renderer/renderModel/renderModel.facade"
import { IdToBuildingService } from "../../../renderer/threeViewer/threeViewer.facade"
import { MapStateReadWindow } from "../../../stores/mapState/mapState.read.facade"

/**
 * How a row looks in the metrics view: it is a building in the 3D map, so the row lens is fed the current
 * area metric (dims rows with no area), the registered building ids (gates selectability) and the root
 * unary count (drives the folder decoration).
 */
@Injectable()
export class MetricsExplorerRow implements ExplorerRow {
    private readonly mapStateReadWindow = inject(MapStateReadWindow)
    private readonly store = inject(Store)
    private readonly idToBuildingService = inject(IdToBuildingService)

    private readonly areaMetric = toSignal(this.mapStateReadWindow.areaMetric$, { requireSync: true })
    private readonly buildingIds = toSignal(this.idToBuildingService.buildingIds$, { requireSync: true })
    private readonly rootUnary = toSignal(this.store.select(rootUnarySelector), { requireSync: true })

    project(node: CodeMapNode): ExplorerRowProjection {
        return projectExplorerRow(node, {
            areaMetric: this.areaMetric(),
            buildingIds: this.buildingIds(),
            rootUnary: this.rootUnary()
        })
    }
}
