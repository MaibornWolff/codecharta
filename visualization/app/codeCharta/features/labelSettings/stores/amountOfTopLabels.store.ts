import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { amountOfTopLabelsSelector } from "../selectors/labelSettings.selectors"
import { setAmountOfTopLabels } from "../../../state/store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"

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
