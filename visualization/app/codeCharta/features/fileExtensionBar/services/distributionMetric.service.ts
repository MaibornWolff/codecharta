import { Injectable } from "@angular/core"
import { MapStateReadWindow } from "../../../stores/mapState/mapState.read.facade"

@Injectable({ providedIn: "root" })
export class DistributionMetricService {
    constructor(private readonly mapStateReadWindow: MapStateReadWindow) {}

    readonly areaMetric$ = this.mapStateReadWindow.areaMetric$
}
