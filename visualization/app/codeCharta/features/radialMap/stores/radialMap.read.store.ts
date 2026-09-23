import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { map } from "rxjs"
import { CcState } from "../../../model/codeCharta.model"
import { isDeltaStateSelector } from "../../../stores/fileStore/fileStore.facade"
import {
    currentFocusedNodePathSelector,
    hoveredNodePathSelector,
    selectedNodePathSelector
} from "../../../stores/sharedView/sharedView.read.facade"
import { radialColoringSelector, radialMetricsSelector, radialTreeSelector } from "../selectors/radialMap.selectors"

@Injectable({ providedIn: "root" })
export class RadialMapReadStore {
    constructor(private readonly store: Store<CcState>) {}

    readonly tree$ = this.store.select(radialTreeSelector)
    readonly metrics$ = this.store.select(radialMetricsSelector)
    readonly coloring$ = this.store.select(radialColoringSelector)
    readonly hoveredNodePath$ = this.store.select(hoveredNodePathSelector)
    readonly selectedNodePath$ = this.store.select(selectedNodePathSelector)
    readonly isDeltaState$ = this.store.select(isDeltaStateSelector)
    readonly isFocused$ = this.store.select(currentFocusedNodePathSelector).pipe(map(Boolean))
}
