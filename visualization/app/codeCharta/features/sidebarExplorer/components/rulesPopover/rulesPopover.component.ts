import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, viewChild } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { SidebarExplorerReadStore } from "../../stores/sidebarExplorer.read.store"
import { RuleRowComponent } from "../ruleRow/ruleRow.component"

@Component({
    selector: "cc-rules-popover",
    templateUrl: "./rulesPopover.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RuleRowComponent]
})
export class RulesPopoverComponent {
    private readonly readStore = inject(SidebarExplorerReadStore)

    readonly kind = input.required<"flatten" | "exclude">()
    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()

    private readonly flattenRules = toSignal(this.readStore.flattenRulesWithCount$, { requireSync: true })
    private readonly excludeRules = toSignal(this.readStore.excludeRulesWithCount$, { requireSync: true })

    readonly rules = computed(() => (this.kind() === "flatten" ? this.flattenRules() : this.excludeRules()))
    readonly title = computed(() => (this.kind() === "flatten" ? "Flattening Rules" : "Hidden Rules"))

    readonly popover = viewChild.required<ElementRef<HTMLElement>>("popover")

    closePopover() {
        this.popover().nativeElement.hidePopover()
    }
}
