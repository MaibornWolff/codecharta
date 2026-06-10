import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { isEdgeMetricVisibleSelector } from "../selectors/edgeAndColors.selectors"
import { toggleEdgeMetricVisible } from "../../../state/store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.actions"

@Injectable({
    providedIn: "root"
})
export class IsEdgeMetricVisibleStore {
    constructor(private readonly store: Store<CcState>) {}

    isEdgeMetricVisible$ = this.store.select(isEdgeMetricVisibleSelector)

    toggleEdgeMetricVisible() {
        this.store.dispatch(toggleEdgeMetricVisible())
    }
}
