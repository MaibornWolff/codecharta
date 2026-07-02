import { Injectable } from "@angular/core"
import { map } from "rxjs"
import { NodeMetricData } from "../../../codeCharta.model"
import { MetricRange, rangeOfMetric } from "../../../util/metric/metricRange"
import { MetricsLensStore } from "../store/metricsLens.store"

function toMetricNames(nodeMetricData: NodeMetricData[]): string[] {
    return nodeMetricData.map(metricData => metricData.name)
}

/** Metric-value data access for the metrics lens. Sync snapshots for the codeMap render path; reactive forms for views. */
@Injectable({ providedIn: "root" })
export class AttributesRepo {
    constructor(private readonly store: MetricsLensStore) {}

    readonly nodeMetricData$ = this.store.nodeMetricData$
    readonly availableMetrics$ = this.store.nodeMetricData$.pipe(map(toMetricNames))
    readonly colorMetricRange$ = this.store.colorMetricRange$

    availableMetrics(): string[] {
        return toMetricNames(this.store.getNodeMetricData())
    }

    getNodeMetricData(): NodeMetricData[] {
        return this.store.getNodeMetricData()
    }

    getColorMetricRange(): MetricRange {
        return this.store.getColorMetricRange()
    }

    rangeOf(metric: string): MetricRange {
        return rangeOfMetric(this.store.getNodeMetricData(), metric)
    }

    rangeOf$(metric: string) {
        return this.store.nodeMetricData$.pipe(map(nodeMetricData => rangeOfMetric(nodeMetricData, metric)))
    }
}
