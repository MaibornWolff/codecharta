import { InjectionToken } from "@angular/core"
import { Observable } from "rxjs"
import { AttributeDescriptors, MetricRule } from "../../model/codeCharta.model"

/**
 * The values a metric actually has, per metric, across the files of the loaded maps — a file with
 * no value for a metric contributes nothing. The editor reads its metric list, its live match count
 * and its distribution from this one map, so all three agree with what a rule will really do.
 */
export type MetricValues = ReadonlyMap<string, number[]>

export interface ExplorerMetricRules {
    readonly metricValues$: Observable<MetricValues>
    readonly descriptors$: Observable<AttributeDescriptors>
    addRule(rule: Omit<MetricRule, "id">): void
}

export const EXPLORER_METRIC_RULES = new InjectionToken<ExplorerMetricRules>("EXPLORER_METRIC_RULES")
