import { Injectable } from "@angular/core"
import { State } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { areaMetricSelector, colorMetricSelector, heightMetricSelector } from "../../../mapState/mapState.facade"

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
