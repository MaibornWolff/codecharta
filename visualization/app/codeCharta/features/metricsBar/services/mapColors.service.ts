import { Injectable } from "@angular/core"
import { MapColors } from "../../../codeCharta.model"
import { MapColorsStore } from "../stores/mapColors.store"

@Injectable({
    providedIn: "root"
})
export class MapColorsService {
    constructor(private readonly mapColorsStore: MapColorsStore) {}

    mapColors$() {
        return this.mapColorsStore.mapColors$
    }

    setMapColors(value: Partial<MapColors>) {
        this.mapColorsStore.setMapColors(value)
    }

    invertColorRange() {
        this.mapColorsStore.invertColorRange()
    }

    invertDeltaColors() {
        this.mapColorsStore.invertDeltaColors()
    }
}
