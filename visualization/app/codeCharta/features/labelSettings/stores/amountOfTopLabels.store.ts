import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { amountOfTopLabelsSelector } from "../../../stores/mapState/mapState.read.facade"
import { setAmountOfTopLabels } from "../../../stores/mapState/mapState.write.facade"

@Injectable({
    providedIn: "root"
})
export class AmountOfTopLabelsStore {
    constructor(private readonly store: Store<CcState>) {}

    amountOfTopLabels$ = this.store.select(amountOfTopLabelsSelector)

    setAmountOfTopLabels(value: number) {
        this.store.dispatch(setAmountOfTopLabels({ value }))
    }
}
