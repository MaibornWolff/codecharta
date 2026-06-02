import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { enableFloorLabelsSelector } from "../../../state/store/appSettings/enableFloorLabels/enableFloorLabels.selector"
import { setEnableFloorLabels } from "../../../state/store/appSettings/enableFloorLabels/enableFloorLabels.actions"

@Injectable({
    providedIn: "root"
})
export class EnableFloorLabelsStore {
    constructor(private readonly store: Store<CcState>) {}

    enableFloorLabels$ = this.store.select(enableFloorLabelsSelector)

    setEnableFloorLabels(value: boolean) {
        this.store.dispatch(setEnableFloorLabels({ value }))
    }
}
