import { Injectable } from "@angular/core"
import { EnableFloorLabelsStore } from "../stores/enableFloorLabels.store"

@Injectable({
    providedIn: "root"
})
export class EnableFloorLabelsService {
    constructor(private readonly enableFloorLabelsStore: EnableFloorLabelsStore) {}

    enableFloorLabels$() {
        return this.enableFloorLabelsStore.enableFloorLabels$
    }

    setEnableFloorLabels(value: boolean) {
        this.enableFloorLabelsStore.setEnableFloorLabels(value)
    }
}
