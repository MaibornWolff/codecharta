import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { formatCompactNumber } from "../../formatCompactNumber"

@Component({
    selector: "cc-explorer-count-chip",
    templateUrl: "./explorerCountChip.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "flex flex-1 min-w-0" }
})
export class ExplorerCountChipComponent {
    readonly label = input.required<string>()
    readonly count = input.required<number>()
    readonly popoverId = input<string | undefined>()
    readonly anchorName = input<string | undefined>()
    readonly tooltip = input<string | undefined>()

    readonly isInteractive = computed(() => !!this.popoverId())
    readonly anchorStyle = computed(() => (this.anchorName() ? `anchor-name: --${this.anchorName()}` : null))
    readonly displayCount = computed(() => formatCompactNumber(this.count()))
    readonly displayTooltip = computed(() => this.tooltip() ?? String(this.count()))
}
