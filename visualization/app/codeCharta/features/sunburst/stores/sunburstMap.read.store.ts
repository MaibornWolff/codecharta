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
import { sunburstColoringSelector, sunburstMetricsSelector, sunburstTreeSelector } from "../selectors/sunburstMap.selectors"

@Injectable({ providedIn: "root" })
export class SunburstMapReadStore {
    constructor(private readonly store: Store<CcState>) {}

    readonly tree$ = this.store.select(sunburstTreeSelector)
    readonly metrics$ = this.store.select(sunburstMetricsSelector)
    readonly coloring$ = this.store.select(sunburstColoringSelector)
    readonly hoveredNodePath$ = this.store.select(hoveredNodePathSelector)
    readonly selectedNodePath$ = this.store.select(selectedNodePathSelector)
    readonly isDeltaState$ = this.store.select(isDeltaStateSelector)
    readonly isFocused$ = this.store.select(currentFocusedNodePathSelector).pipe(map(Boolean))
}
