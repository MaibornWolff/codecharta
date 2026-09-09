import { Injectable, inject } from "@angular/core"
import { Store } from "@ngrx/store"
import { ExplorerRules, RuleWithCount } from "../../../features/sidebarExplorer/facade"
import { BlacklistType, CcState } from "../../../model/codeCharta.model"
import { clearRulesOfType, removeBlacklistItem, removeMetricRule } from "../../../stores/sharedView/sharedView.write.facade"
import { dispatchAfterPaint } from "../../../util/dispatchAfterPaint"
import { blacklistSearchPattern } from "../effects/blacklistSearchPattern/blacklistSearchPattern.effect"
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
        dispatchAfterPaint(this.store, removeBlacklistItem({ item: rule.item }))
    }

    clearRules(type: BlacklistType) {
        dispatchAfterPaint(this.store, clearRulesOfType({ blacklistType: type }))
    }

    ruleFromSearchPattern(type: BlacklistType) {
        dispatchAfterPaint(this.store, blacklistSearchPattern(type))
    }
}
