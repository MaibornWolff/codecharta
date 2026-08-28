import { Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { ExplorerRow } from "../../../features/sidebarExplorer/facade"
import { ExplorerRowProjection, projectExplorerRow } from "../../../lenses/explorerRow/explorerRowLens.facade"
import { CodeMapNode } from "../../../model/codeCharta.model"
import { rootUnarySelector } from "../../../renderer/renderModel/renderModel.facade"
import { IdToBuildingService } from "../../../renderer/threeViewer/threeViewer.facade"
import { MapStateReadWindow } from "../../../stores/mapState/mapState.read.facade"
import { SharedViewReadWindow } from "../../../stores/sharedView/sharedView.read.facade"

@Injectable()
export class MetricsExplorerRow implements ExplorerRow {
    private readonly mapStateReadWindow = inject(MapStateReadWindow)
    private readonly sharedViewReadWindow = inject(SharedViewReadWindow)
    private readonly store = inject(Store)
    private readonly idToBuildingService = inject(IdToBuildingService)

    private readonly areaMetric = toSignal(this.mapStateReadWindow.areaMetric$, { requireSync: true })
    private readonly buildingIds = toSignal(this.idToBuildingService.buildingIds$, { requireSync: true })
    private readonly rootUnary = toSignal(this.store.select(rootUnarySelector), { requireSync: true })
    private readonly markedPackages = toSignal(this.sharedViewReadWindow.markedPackages$, { requireSync: true })

    project(node: CodeMapNode): ExplorerRowProjection {
        return projectExplorerRow(node, {
            areaMetric: this.areaMetric(),
            buildingIds: this.buildingIds(),
            rootUnary: this.rootUnary(),
            showsFlattenedState: true,
            hidesExcludedNodes: true,
            markedPackages: this.markedPackages()
        })
    }
}
