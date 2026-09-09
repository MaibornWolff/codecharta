import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { EXPLORER_METRIC_RULES } from "../../explorerMetricRules.port"
import { EXPLORER_RULES } from "../../explorerRules.port"
import { EXPLORER_SEARCH } from "../../explorerSearch.port"

@Component({
    selector: "cc-explorer-search-actions",
    templateUrl: "./explorerSearchActions.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerSearchActionsComponent {
    private readonly rules = inject(EXPLORER_RULES)

    /** Absent in views that have no metrics to filter by, which hides the two metric entries. */
    readonly hasMetricRules = inject(EXPLORER_METRIC_RULES, { optional: true }) !== null

    readonly isSearchPatternEmpty = toSignal(inject(EXPLORER_SEARCH).isPatternEmpty$, { requireSync: true })
    readonly isFlattenPatternDisabled = toSignal(this.rules.isFlattenPatternDisabled$, { requireSync: true })
    readonly isExcludePatternDisabled = toSignal(this.rules.isExcludePatternDisabled$, { requireSync: true })

    flattenPattern() {
        this.rules.ruleFromSearchPattern("flatten")
    }

    excludePattern() {
        this.rules.ruleFromSearchPattern("exclude")
    }
}
