import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { CodeMapNode, NodeType } from "../../../../model/codeCharta.model"
import { EXPLORER_SEARCH } from "../../explorerSearch.port"

@Component({
    selector: "cc-explorer-tree-item-name",
    templateUrl: "./explorerTreeItemName.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerTreeItemNameComponent {
    readonly node = input.required<CodeMapNode>()
    readonly isInactive = input<boolean>(false)
    readonly isItalic = input<boolean>(false)
    readonly isFlattened = input<boolean>(false)

    readonly searchedNodePaths = toSignal(inject(EXPLORER_SEARCH).searchedNodePaths$, { requireSync: true })

    readonly isSearchResult = computed(() => this.searchedNodePaths().has(this.node().path))
    readonly isFlattenedFile = computed(() => this.isFlattened() && this.node().type === NodeType.FILE)
}
