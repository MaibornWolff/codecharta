import { Injectable } from "@angular/core"
import { LegendMapColorsStore } from "../stores/mapColors.store"

@Injectable({
    providedIn: "root"
})
export class LegendMapColorsService {
    constructor(private readonly mapColorsStore: LegendMapColorsStore) {}

    mapColors$() {
        return this.mapColorsStore.mapColors$
    }
}
