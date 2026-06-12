import { Injectable } from "@angular/core"
import { LegendColorRangeStore } from "../stores/colorRange.store"

@Injectable({
    providedIn: "root"
})
export class LegendColorRangeService {
    constructor(private readonly colorRangeStore: LegendColorRangeStore) {}

    colorRange$() {
        return this.colorRangeStore.colorRange$
    }
}
