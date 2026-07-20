import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { CodeMapNode, NodeType } from "../../../../model/codeCharta.model"
import { SidebarExplorerReadStore } from "../../stores/sidebarExplorer.read.store"

@Component({
    selector: "cc-explorer-tree-item-name",
    templateUrl: "./explorerTreeItemName.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerTreeItemNameComponent {
    private readonly readStore = inject(SidebarExplorerReadStore)

    readonly node = input.required<CodeMapNode>()
    // Why a name is muted or italic is the hosting view's call (see ExplorerHost.rowState), so it
    // arrives as plain presentation flags rather than being re-derived from map state here.
    readonly isDimmed = input<boolean>(false)
    readonly isItalic = input<boolean>(false)

    readonly searchedNodePaths = toSignal(this.readStore.searchedNodePaths$, { requireSync: true })

    readonly isSearchResult = computed(() => this.searchedNodePaths().has(this.node().path))
    readonly isFlattenedFile = computed(() => Boolean(this.node().isFlattened) && this.node().type === NodeType.FILE)
}
