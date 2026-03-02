import { Injectable } from "@angular/core"
import { AmountOfTopLabelsStore } from "../stores/amountOfTopLabels.store"

@Injectable({
    providedIn: "root"
})
export class AmountOfTopLabelsService {
    constructor(private readonly amountOfTopLabelsStore: AmountOfTopLabelsStore) {}

    amountOfTopLabels$() {
        return this.amountOfTopLabelsStore.amountOfTopLabels$
    }

    setAmountOfTopLabels(value: number) {
        this.amountOfTopLabelsStore.setAmountOfTopLabels(value)
    }
}
