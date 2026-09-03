import { ChangeDetectionStrategy, Component, computed, input, output } from "@angular/core"
import { WordOccurrenceNode } from "../../../../lenses/domain/domainLens.facade"
import { formatCompactNumber } from "../../../../util/formatCompactNumber"
import { ExplorerRowComponent, ExplorerTreeItemIconComponent } from "../../../sidebarExplorer/facade"
import { formatShare } from "../../util/formatShare"

@Component({
    selector: "cc-domain-word-occurrence-row",
    templateUrl: "./domainWordOccurrenceRow.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ExplorerRowComponent, ExplorerTreeItemIconComponent],
    host: { class: "block", "[attr.aria-expanded]": "isExpandable() ? isExpanded() : null", "(click)": "clicked.emit()" }
})
export class DomainWordOccurrenceRowComponent {
    readonly node = input.required<WordOccurrenceNode>()
    readonly isExpanded = input(false)
    readonly isSelected = input(false)

    readonly clicked = output<void>()

    protected readonly isExpandable = computed(() => this.node().children.length > 0)
    /** The share reads like the metric explorer's row decoration, so both lists say "part / amount". */
    protected readonly decoration = computed(() => `${formatShare(this.node().share)} / ${formatCompactNumber(this.node().count)}`)
}
