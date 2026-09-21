import { InjectionToken } from "@angular/core"
import { Observable } from "rxjs"
import { MetricRule, NodeRule, RuleEffect } from "../../model/codeCharta.model"

/**
 * One row of a rules popover. `label` is what the row shows and `id` identifies it for tracking;
 * the variant carries whatever the port needs to remove it, so a row never has to be resolved
 * back to its source.
 */
interface RuleRow {
    id: string
    label: string
    affectedCount: number
}

export type RuleWithCount =
    | (RuleRow & { kind: "RULE" | "MANUAL"; item: NodeRule; effect: RuleEffect })
    | (RuleRow & { kind: "METRIC"; metricRule: MetricRule })

export interface ExplorerRules {
    readonly flattenRules$: Observable<RuleWithCount[]>
    readonly excludeRules$: Observable<RuleWithCount[]>
    readonly isFlattenPatternDisabled$: Observable<boolean>
    readonly isExcludePatternDisabled$: Observable<boolean>
    removeRule(rule: RuleWithCount): void
    /** Empties one list: its metric, pattern and hand-picked rules alike. */
    clearRules(effect: RuleEffect): void
    ruleFromSearchPattern(effect: RuleEffect): void
}

export const EXPLORER_RULES = new InjectionToken<ExplorerRules>("EXPLORER_RULES")
