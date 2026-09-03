import { ChangeDetectionStrategy, Component, computed, inject, input, output } from "@angular/core"
import { WordOccurrenceNode } from "../../../../lenses/domain/domainLens.facade"
import { formatCompactNumber } from "../../../../util/formatCompactNumber"
import { ExplorerRowComponent, ExplorerRowContextMenuService, ExplorerTreeItemIconComponent } from "../../../sidebarExplorer/facade"
import { formatShare } from "../../util/formatShare"

@Component({
    selector: "cc-domain-word-occurrence-row",
    templateUrl: "./domainWordOccurrenceRow.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ExplorerRowComponent, ExplorerTreeItemIconComponent],
    host: {
        class: "block",
        "[attr.aria-expanded]": "isExpandable() ? isExpanded() : null",
        "(click)": "clicked.emit()",
        "(contextmenu)": "openContextMenu($event)"
    }
})
export class DomainWordOccurrenceRowComponent {
    private readonly contextMenu = inject(ExplorerRowContextMenuService)

    readonly node = input.required<WordOccurrenceNode>()
    readonly isExpanded = input(false)
    readonly isSelected = input(false)

    readonly clicked = output<void>()

    protected readonly isExpandable = computed(() => this.node().children.length > 0)
    protected readonly isMarked = computed(() => this.contextMenu.isMarked(this.node().path))
    /** The share reads like the metric explorer's row decoration, so both lists say "part / amount". */
    protected readonly decoration = computed(() => `${formatShare(this.node().share)} / ${formatCompactNumber(this.node().count)}`)

    protected openContextMenu(event: MouseEvent): void {
        this.contextMenu.openFor(this.node().path, event)
    }
}
