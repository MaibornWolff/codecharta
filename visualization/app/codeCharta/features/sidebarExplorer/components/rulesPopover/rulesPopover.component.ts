import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, viewChild } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { EMPTY } from "rxjs"
import { ConfirmDialogComponent } from "../../../shared/facade"
import { EXPLORER_COUNTS } from "../../explorerCounts.port"
import { EXPLORER_METRIC_RULES } from "../../explorerMetricRules.port"
import { EXPLORER_RULES } from "../../explorerRules.port"
import { RuleRowComponent } from "../ruleRow/ruleRow.component"

@Component({
    selector: "cc-rules-popover",
    templateUrl: "./rulesPopover.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RuleRowComponent, ConfirmDialogComponent]
})
export class RulesPopoverComponent {
    private readonly rules = inject(EXPLORER_RULES)
    private readonly countsSource = inject(EXPLORER_COUNTS, { optional: true })

    readonly kind = input.required<"flatten" | "exclude">()
    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()

    private readonly flattenRules = toSignal(this.rules.flattenRules$, { requireSync: true })
    private readonly excludeRules = toSignal(this.rules.excludeRules$, { requireSync: true })
    private readonly counts = toSignal(this.countsSource?.counts$ ?? EMPTY, { initialValue: null })

    readonly rulesOfKind = computed(() => (this.kind() === "flatten" ? this.flattenRules() : this.excludeRules()))
    readonly title = computed(() => (this.kind() === "flatten" ? "Flattening Rules" : "Hidden Rules"))

    readonly hasMetricRules = inject(EXPLORER_METRIC_RULES, { optional: true }) !== null

    readonly editorPopoverId = computed(() => (this.kind() === "flatten" ? "explorer-flatten-metric-rule" : "explorer-exclude-metric-rule"))

    readonly clearLabel = computed(() => {
        const ruleCount = this.rulesOfKind().length
        return ruleCount === 1 ? "Clear 1 rule" : `Clear all ${ruleCount} rules`
    })

    readonly confirmTestId = computed(() => `rules-popover-clear-confirm-${this.kind()}`)

    readonly confirmTitle = computed(() => `Confirm clear ${this.kind() === "flatten" ? "flatten" : "hide"} rules`)

    readonly confirmMessage = computed(() => `${this.describeRules()} and ${this.describeAffectedFiles()}.`)

    private describeRules() {
        const ruleCount = this.rulesOfKind().length
        const noun = this.kind() === "flatten" ? "flatten" : "hide"
        return ruleCount === 1 ? `The 1 ${noun} rule is removed` : `All ${ruleCount} ${noun} rules are removed`
    }

    private describeAffectedFiles() {
        const counts = this.counts()
        const affected = this.kind() === "flatten" ? counts?.flattened : counts?.hidden
        const outcome = this.kind() === "flatten" ? "drawn at full height again" : "back on the map"
        if (affected === undefined) {
            return `every file they affect is ${outcome}`
        }
        return affected === 1 ? `1 file is ${outcome}` : `${affected} files are ${outcome}`
    }

    readonly popover = viewChild.required<ElementRef<HTMLElement>>("popover")
    private readonly confirmDialog = viewChild.required<ConfirmDialogComponent>("confirmDialog")

    closePopover() {
        this.popover().nativeElement.hidePopover()
    }

    // The popover has to go first: a modal dialog opened underneath an open popover is light-dismissed
    // together with it, and the confirmation would flash and vanish.
    requestClear() {
        this.closePopover()
        this.confirmDialog().open()
    }

    confirmClear() {
        this.rules.clearRules(this.kind())
    }
}
