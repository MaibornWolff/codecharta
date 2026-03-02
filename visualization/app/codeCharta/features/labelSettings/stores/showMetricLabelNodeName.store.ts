import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { showMetricLabelNodeNameSelector } from "../selectors/labelSettings.selectors"
import { setShowMetricLabelNodeName } from "../../../state/store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.actions"

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
