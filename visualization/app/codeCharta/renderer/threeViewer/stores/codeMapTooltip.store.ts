import { Injectable } from "@angular/core"
import { MapStateReadWindow } from "../../../stores/mapState/mapState.read.facade"

@Injectable({ providedIn: "root" })
export class CodeMapTooltipStore {
    constructor(private readonly mapStateReadWindow: MapStateReadWindow) {}

    getSelectedMetrics() {
        return {
            areaMetric: this.mapStateReadWindow.getAreaMetric(),
            heightMetric: this.mapStateReadWindow.getHeightMetric(),
            colorMetric: this.mapStateReadWindow.getColorMetric()
        }
    }
}
