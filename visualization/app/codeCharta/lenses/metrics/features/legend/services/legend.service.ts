import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../../../codeCharta.model"
import { isDeltaStateSelector } from "../../../../../state/selectors/isDeltaState.selector"
import { mapColorsSelector, areaMetricSelector, colorMetricSelector, edgeMetricSelector, heightMetricSelector } from "../../../../../mapState/mapState.facade"
import { colorRangeSelector } from "../../../../../mapState/store/colorRange/colorRange.selector"
import { AttributesRepo } from "../../../repos/attributes.repo"
import { DescriptorsRepo } from "../../../repos/descriptors.repo"

/**
 * The single seam every legend component injects. Metric data comes from the metrics-lens repos
 * (a feature inside the lens reads the repos, not the lens facade — that facade is the lens's outward
 * boundary); the remaining seven reads are view/appearance settings with no 2.0 home this slice and
 * stay as documented temporary direct selector reads (this keeps `@ngrx`-in-service, allowed at `warn`
 * via `metrics-lens-ngrx-guard` until viewState/appearance land).
 */
@Injectable({ providedIn: "root" })
export class LegendService {
    constructor(
        private readonly attributesRepo: AttributesRepo,
        private readonly descriptorsRepo: DescriptorsRepo,
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
        return this.attributesRepo.colorMetricRange$
    }

    attributeDescriptors$() {
        return this.descriptorsRepo.descriptors$
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
