import { Injectable } from "@angular/core"
import { LabelsPerMapStore } from "../stores/labelsPerMap.store"

@Injectable({
    providedIn: "root"
})
export class LabelsPerMapService {
    constructor(private readonly labelsPerMapStore: LabelsPerMapStore) {}

    labelsPerMap$() {
        return this.labelsPerMapStore.labelsPerMap$
    }

    setLabelsPerMap(value: boolean) {
        this.labelsPerMapStore.setLabelsPerMap(value)
    }
}
