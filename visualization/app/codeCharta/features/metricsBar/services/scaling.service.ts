import { Injectable } from "@angular/core"
import { Scaling } from "../../../codeCharta.model"
import { ScalingStore } from "../stores/scaling.store"

@Injectable({
    providedIn: "root"
})
export class ScalingService {
    constructor(private readonly scalingStore: ScalingStore) {}

    scaling$() {
        return this.scalingStore.scaling$
    }

    setScaling(value: Partial<Scaling>) {
        this.scalingStore.setScaling(value)
    }
}
