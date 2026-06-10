import { Injectable } from "@angular/core"
import { MapColorsStore } from "../stores/mapColors.store"

@Injectable({
    providedIn: "root"
})
export class MapColorsService {
    constructor(private readonly mapColorsStore: MapColorsStore) {}

    mapColors$() {
        return this.mapColorsStore.mapColors$
    }

    invertColorRange() {
        this.mapColorsStore.invertColorRange()
    }

    invertDeltaColors() {
        this.mapColorsStore.invertDeltaColors()
    }
}
