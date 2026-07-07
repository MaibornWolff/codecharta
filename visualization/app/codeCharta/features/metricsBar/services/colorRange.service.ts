import { Injectable } from "@angular/core"
import { ColorRange } from "../../../model/codeCharta.model"
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

    selectedColorMetricData$() {
        return this.colorRangeStore.selectedColorMetricData$
    }

    setColorRange(value: Partial<ColorRange>) {
        this.colorRangeStore.setColorRange(value)
    }
}
