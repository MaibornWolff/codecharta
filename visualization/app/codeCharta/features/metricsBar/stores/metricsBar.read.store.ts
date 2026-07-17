import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { AttributeTypes, CcState, PrimaryMetrics } from "../../../model/codeCharta.model"
import {
    accumulatedDataSelector,
    amountOfBuildingsWithSelectedEdgeMetricSelector,
    hoveredNodeSelector,
    metricDataSelector,
    metricRangeSelector,
    primaryMetricNamesSelector,
    selectedNodeSelector
} from "../../../renderer/renderModel/renderModel.facade"
import { createAttributeTypeSelector } from "../selectors/createAttributeTypeSelector.selector"
import { markableFolderPathsSelector } from "../selectors/markableFolderPaths.selector"
import { markedPackagesWithCountsSelector } from "../selectors/markedPackagesWithCounts.selector"
import { metricColorRangeColorsSelector } from "../selectors/metricColorRangeColors.selector"
import { metricColorRangeValuesSelector } from "../selectors/metricColorRangeValues.selector"

@Injectable({
    providedIn: "root"
})
export class MetricsBarReadStore {
    constructor(private readonly store: Store<CcState>) {}

    readonly metricData$ = this.store.select(metricDataSelector)
    readonly primaryMetricNames$ = this.store.select(primaryMetricNamesSelector)
    readonly amountOfBuildingsWithSelectedEdgeMetric$ = this.store.select(amountOfBuildingsWithSelectedEdgeMetricSelector)
    readonly selectedColorMetricData$ = this.store.select(metricRangeSelector)
    readonly metricColorRangeColors$ = this.store.select(metricColorRangeColorsSelector)
    readonly metricColorRangeValues$ = this.store.select(metricColorRangeValuesSelector)
    readonly markedPackagesWithCounts$ = this.store.select(markedPackagesWithCountsSelector)
    readonly markableFolderPaths$ = this.store.select(markableFolderPathsSelector)
    readonly hoveredNode$ = this.store.select(hoveredNodeSelector)
    readonly selectedNode$ = this.store.select(selectedNodeSelector)
    readonly accumulatedData$ = this.store.select(accumulatedDataSelector)

    attributeTypeLabel$(attributeType: keyof AttributeTypes, metricFor: keyof PrimaryMetrics) {
        return this.store.select(createAttributeTypeSelector(attributeType, metricFor))
    }
}
