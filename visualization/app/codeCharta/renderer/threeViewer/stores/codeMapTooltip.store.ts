import { Injectable } from "@angular/core"
import { State } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { areaMetricSelector, colorMetricSelector, heightMetricSelector } from "../../../stores/mapState/mapState.read.facade"

@Injectable({ providedIn: "root" })
export class CodeMapTooltipStore {
    constructor(private readonly state: State<CcState>) {}

    // The hover tooltip labels each row with the currently selected area/height/color metric. Those live
    // in the mapState home (moved there from dynamicSettings in Slice 7); read them through its facade.
    getSelectedMetrics() {
        const state = this.state.getValue()
        return {
            areaMetric: areaMetricSelector(state),
            heightMetric: heightMetricSelector(state),
            colorMetric: colorMetricSelector(state)
        }
    }
}
