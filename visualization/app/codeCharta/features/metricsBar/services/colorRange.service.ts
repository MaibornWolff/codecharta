import { Injectable } from "@angular/core"
import { ColorRange } from "../../../codeCharta.model"
import { ColorRangeStore } from "../stores/colorRange.store"

@Injectable({
    providedIn: "root"
})
export class ColorRangeService {
    constructor(private readonly colorRangeStore: ColorRangeStore) {}

    colorRange$() {
        return this.colorRangeStore.colorRange$
    }

    metricColorRangeColors$() {
        return this.colorRangeStore.metricColorRangeColors$
    }

    metricColorRangeValues$() {
        return this.colorRangeStore.metricColorRangeValues$
    }

    setColorRange(value: Partial<ColorRange>) {
        this.colorRangeStore.setColorRange(value)
    }
}
