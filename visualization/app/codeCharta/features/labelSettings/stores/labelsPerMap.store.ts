import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { labelsPerMapSelector } from "../selectors/labelSettings.selectors"
import { setLabelsPerMap } from "../../../state/store/appSettings/labelsPerMap/labelsPerMap.actions"

@Injectable({
    providedIn: "root"
})
export class LabelsPerMapStore {
    constructor(private readonly store: Store<CcState>) {}

    labelsPerMap$ = this.store.select(labelsPerMapSelector)

    setLabelsPerMap(value: boolean) {
        this.store.dispatch(setLabelsPerMap({ value }))
    }
}
