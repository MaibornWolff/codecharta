import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../../../codeCharta.model"
import { isDeltaStateSelector } from "../../../../../state/selectors/isDeltaState.selector"
import { mapColorsSelector } from "../../../../../state/store/appSettings/mapColors/mapColors.selector"
import { areaMetricSelector } from "../../../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { colorMetricSelector } from "../../../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { colorRangeSelector } from "../../../../../state/store/dynamicSettings/colorRange/colorRange.selector"
import { edgeMetricSelector } from "../../../../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { heightMetricSelector } from "../../../../../state/store/dynamicSettings/heightMetric/heightMetric.selector"
import { MetricsLensFacade } from "../../../metricsLens.facade"

/**
 * The single seam every legend component injects. Metric data comes from the metrics-lens facade;
 * the remaining seven reads are view/appearance settings with no 2.0 home this slice and stay as
 * documented temporary direct selector reads (this keeps `@ngrx`-in-service, allowed at `warn` via
 * `metrics-lens-ngrx-guard` until viewState/appearance land).
 */
@Injectable({ providedIn: "root" })
export class LegendService {
    constructor(
        private readonly metricsLensFacade: MetricsLensFacade,
        private readonly store: Store<CcState>
    ) {}

    private readonly areaMetric = this.store.select(areaMetricSelector)
    private readonly heightMetric = this.store.select(heightMetricSelector)
    private readonly colorMetric = this.store.select(colorMetricSelector)
    private readonly edgeMetric = this.store.select(edgeMetricSelector)
    private readonly colorRange = this.store.select(colorRangeSelector)
    private readonly mapColors = this.store.select(mapColorsSelector)
    private readonly isDeltaState = this.store.select(isDeltaStateSelector)

    selectedColorMetricData$() {
        return this.metricsLensFacade.selectedColorMetricData$
    }

    attributeDescriptors$() {
        return this.metricsLensFacade.descriptors$
    }

    areaMetric$() {
        return this.areaMetric
    }

    heightMetric$() {
        return this.heightMetric
    }

    colorMetric$() {
        return this.colorMetric
    }

    edgeMetric$() {
        return this.edgeMetric
    }

    colorRange$() {
        return this.colorRange
    }

    mapColors$() {
        return this.mapColors
    }

    isDeltaState$() {
        return this.isDeltaState
    }
}
