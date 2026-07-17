import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { selectedNodeSelector } from "../../../renderer/renderModel/renderModel.facade"
import { inspectorMappingBlocksSelector } from "../selectors/inspectorMappingBlocks.selector"
import { inspectorMetricRowsSelector } from "../selectors/inspectorMetricRows.selector"

@Injectable({
    providedIn: "root"
})
export class SidebarInspectorReadStore {
    constructor(private readonly store: Store<CcState>) {}

    readonly selectedNode$ = this.store.select(selectedNodeSelector)
    readonly mappingBlocks$ = this.store.select(inspectorMappingBlocksSelector)
    readonly metricRows$ = this.store.select(inspectorMetricRowsSelector)
}
