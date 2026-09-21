import { Injectable, inject } from "@angular/core"
import { Store } from "@ngrx/store"
import { ExplorerRules, RuleWithCount } from "../../../features/sidebarExplorer/facade"
import { CcState, RuleEffect } from "../../../model/codeCharta.model"
import {
    clearRulesOfType,
    removeExcludedNodes,
    removeFlattenedNodes,
    removeMetricRule
} from "../../../stores/sharedView/sharedView.write.facade"
import { dispatchAfterPaint } from "../../../util/dispatchAfterPaint"
import { ruleFromSearchPattern } from "../effects/ruleFromSearchPattern/ruleFromSearchPattern.effect"
import { excludeRulesWithCountSelector, flattenRulesWithCountSelector } from "./explorerRules.selectors"
import { isExcludePatternDisabledSelector, isFlattenPatternDisabledSelector } from "./isPatternDisabled.selector"

@Injectable()
export class MetricsExplorerRules implements ExplorerRules {
    private readonly store = inject<Store<CcState>>(Store)

    readonly flattenRules$ = this.store.select(flattenRulesWithCountSelector)
    readonly excludeRules$ = this.store.select(excludeRulesWithCountSelector)
    readonly isFlattenPatternDisabled$ = this.store.select(isFlattenPatternDisabledSelector)
    readonly isExcludePatternDisabled$ = this.store.select(isExcludePatternDisabledSelector)

    removeRule(rule: RuleWithCount) {
        if (rule.kind === "METRIC") {
            dispatchAfterPaint(this.store, removeMetricRule({ id: rule.metricRule.id }))
            return
        }
        const removeRuleAction =
            rule.effect === "flatten" ? removeFlattenedNodes({ items: [rule.item] }) : removeExcludedNodes({ items: [rule.item] })
        dispatchAfterPaint(this.store, removeRuleAction)
    }

    clearRules(effect: RuleEffect) {
        dispatchAfterPaint(this.store, clearRulesOfType({ ruleEffect: effect }))
    }

    ruleFromSearchPattern(effect: RuleEffect) {
        dispatchAfterPaint(this.store, ruleFromSearchPattern(effect))
    }
}
