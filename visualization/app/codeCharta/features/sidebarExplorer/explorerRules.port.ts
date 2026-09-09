import { InjectionToken } from "@angular/core"
import { Observable } from "rxjs"
import { BlacklistItem, BlacklistType } from "../../model/codeCharta.model"

export type ExplorerRuleKind = "RULE" | "MANUAL"

/**
 * One row of a rules popover. `label` is what the row shows and `id` identifies it for tracking;
 * the variant carries whatever the port needs to remove it, so a row never has to be resolved
 * back to its source.
 */
export type RuleWithCount = {
    id: string
    label: string
    affectedCount: number
    kind: ExplorerRuleKind
    item: BlacklistItem
}

export interface ExplorerRules {
    readonly flattenRules$: Observable<RuleWithCount[]>
    readonly excludeRules$: Observable<RuleWithCount[]>
    readonly isFlattenPatternDisabled$: Observable<boolean>
    readonly isExcludePatternDisabled$: Observable<boolean>
    removeRule(rule: RuleWithCount): void
    ruleFromSearchPattern(type: BlacklistType): void
}

export const EXPLORER_RULES = new InjectionToken<ExplorerRules>("EXPLORER_RULES")
