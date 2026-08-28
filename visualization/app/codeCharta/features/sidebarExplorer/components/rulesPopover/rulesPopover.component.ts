import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, viewChild } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { EXPLORER_RULES } from "../../explorerRules.port"
import { RuleRowComponent } from "../ruleRow/ruleRow.component"

@Component({
    selector: "cc-rules-popover",
    templateUrl: "./rulesPopover.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RuleRowComponent]
})
export class RulesPopoverComponent {
    private readonly rules = inject(EXPLORER_RULES)

    readonly kind = input.required<"flatten" | "exclude">()
    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()

    private readonly flattenRules = toSignal(this.rules.flattenRules$, { requireSync: true })
    private readonly excludeRules = toSignal(this.rules.excludeRules$, { requireSync: true })

    readonly rulesOfKind = computed(() => (this.kind() === "flatten" ? this.flattenRules() : this.excludeRules()))
    readonly title = computed(() => (this.kind() === "flatten" ? "Flattening Rules" : "Hidden Rules"))

    readonly popover = viewChild.required<ElementRef<HTMLElement>>("popover")

    closePopover() {
        this.popover().nativeElement.hidePopover()
    }
}
