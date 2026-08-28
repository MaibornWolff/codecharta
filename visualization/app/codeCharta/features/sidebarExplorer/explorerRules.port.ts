import { InjectionToken } from "@angular/core"
import { Observable } from "rxjs"
import { BlacklistItem, BlacklistType } from "../../model/codeCharta.model"

export interface RuleWithCount {
    item: BlacklistItem
    affectedCount: number
    kind: "RULE" | "MANUAL"
}

export interface ExplorerRules {
    readonly flattenRules$: Observable<RuleWithCount[]>
    readonly excludeRules$: Observable<RuleWithCount[]>
    readonly isFlattenPatternDisabled$: Observable<boolean>
    readonly isExcludePatternDisabled$: Observable<boolean>
    removeRule(item: BlacklistItem): void
    ruleFromSearchPattern(type: BlacklistType): void
}

export const EXPLORER_RULES = new InjectionToken<ExplorerRules>("EXPLORER_RULES")
