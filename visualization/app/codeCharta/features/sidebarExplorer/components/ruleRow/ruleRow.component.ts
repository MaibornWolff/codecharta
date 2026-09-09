import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core"
import { EXPLORER_RULES, RuleWithCount } from "../../explorerRules.port"

@Component({
    selector: "cc-rule-row",
    templateUrl: "./ruleRow.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "flex items-center gap-2 px-2 py-1.5 hover:bg-base-200 transition-colors border-b border-base-200 last:border-b-0" }
})
export class RuleRowComponent {
    private readonly rules = inject(EXPLORER_RULES)

    readonly rule = input.required<RuleWithCount>()

    readonly label = computed(() => this.rule().label)
    readonly kind = computed(() => this.rule().kind)
    readonly affectedCount = computed(() => this.rule().affectedCount)

    remove() {
        this.rules.removeRule(this.rule())
    }
}
