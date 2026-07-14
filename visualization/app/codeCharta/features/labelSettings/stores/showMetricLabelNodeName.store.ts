import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { showMetricLabelNodeNameSelector } from "../../../stores/mapState/mapState.read.facade"
import { setShowMetricLabelNodeName } from "../../../stores/mapState/mapState.write.facade"

@Injectable({
    providedIn: "root"
})
export class ShowMetricLabelNodeNameStore {
    constructor(private readonly store: Store<CcState>) {}

    showMetricLabelNodeName$ = this.store.select(showMetricLabelNodeNameSelector)

    setShowMetricLabelNodeName(value: boolean) {
        this.store.dispatch(setShowMetricLabelNodeName({ value }))
    }
}
