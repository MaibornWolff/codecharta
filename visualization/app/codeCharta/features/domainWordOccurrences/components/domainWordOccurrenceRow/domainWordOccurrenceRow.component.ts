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
    readonly word = input.required<string>()
    readonly isExpanded = input(false)
    readonly isSelected = input(false)

    readonly clicked = output<void>()

    protected readonly isExpandable = computed(() => this.node().children.length > 0)
    protected readonly isMarked = computed(() => this.contextMenu.isMarked(this.node().path))
    /** Part of this one word's occurrences, not of the project's words — the word row above states that
     * one, and only naming both keeps the two percentages apart. */
    protected readonly decoration = computed(
        () => `${formatShare(this.node().share)} of "${this.word()}" · ${formatCompactNumber(this.node().count)}`
    )

    protected openContextMenu(event: MouseEvent): void {
        this.contextMenu.openFor(this.node().path, event)
    }
}
