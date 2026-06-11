import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { inspectorMappingBlocksSelector } from "../selectors/inspectorMappingBlocks.selector"

@Injectable({
    providedIn: "root"
})
export class InspectorMappingBlocksStore {
    constructor(private readonly store: Store<CcState>) {}

    mappingBlocks$ = this.store.select(inspectorMappingBlocksSelector)
}
