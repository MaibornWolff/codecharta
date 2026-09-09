import { Injectable, inject } from "@angular/core"
import { Store } from "@ngrx/store"
import { ExplorerMetricRules } from "../../../features/sidebarExplorer/facade"
import { CcState, MetricRule } from "../../../model/codeCharta.model"
import { addMetricRule } from "../../../stores/sharedView/sharedView.write.facade"
import { dispatchAfterPaint } from "../../../util/dispatchAfterPaint"
import { metricValuesSelector } from "./metricValues.selector"

@Injectable()
export class MetricsExplorerMetricRules implements ExplorerMetricRules {
    private readonly store = inject<Store<CcState>>(Store)

    readonly metricValues$ = this.store.select(metricValuesSelector)

    addRule(rule: Omit<MetricRule, "id">) {
        dispatchAfterPaint(this.store, addMetricRule({ rule: { ...rule, id: createRuleId() } }))
    }
}

function createRuleId(): string {
    return `metric-rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
