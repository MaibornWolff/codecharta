import { NgClass } from "@angular/common"
import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"

/** The look of one explorer row. Everything the explorer lists — nodes, words, a word's occurrences —
 * goes through it, so the panel reads as one list. Consumers bind their own events on this element. */
@Component({
    selector: "cc-explorer-row",
    templateUrl: "./explorerRow.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass],
    host: { class: "block" }
})
export class ExplorerRowComponent {
    readonly rowId = input<string | null>(null)
    readonly hint = input("")
    readonly decoration = input<string | null>(null)
    /** How much of the row a bar fills, 0 to 1. It is the decorated percentage made visible, so a list
     * can be read by its bars alone. */
    readonly barShare = input(0)
    readonly isSelected = input(false)
    readonly isHovered = input(false)
    readonly isMarked = input(false)
    readonly isRevealed = input(false)

    protected readonly barPercent = computed(() => Math.min(Math.max(this.barShare(), 0), 1) * 100)

    protected readonly stateClasses = computed(() => ({
        hovered: this.isHovered(),
        "bg-base-200": this.isHovered() && !this.isSelected(),
        marked: this.isMarked(),
        "ring-2": this.isMarked(),
        "ring-primary": this.isMarked(),
        selected: this.isSelected(),
        "font-semibold": this.isSelected(),
        "bg-error/20": this.isSelected(),
        "bg-primary/20": this.isRevealed()
    }))
}
