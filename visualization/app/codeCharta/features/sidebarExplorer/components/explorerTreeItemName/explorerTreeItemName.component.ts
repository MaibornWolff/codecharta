import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { CodeMapNode, NodeType } from "../../../../codeCharta.model"
import { isAreaValid } from "../../../../util/codeMapHelper"
import { ExplorerAreaMetricStore } from "../../stores/areaMetric.store"
import { SearchedNodePathsStore } from "../../stores/searchedNodePaths.store"

@Component({
    selector: "cc-explorer-tree-item-name",
    templateUrl: "./explorerTreeItemName.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerTreeItemNameComponent {
    private readonly areaMetricStore = inject(ExplorerAreaMetricStore)
    private readonly searchedNodePathsStore = inject(SearchedNodePathsStore)

    readonly node = input.required<CodeMapNode>()
    readonly isUnclickable = input<boolean>(false)

    readonly searchedNodePaths = toSignal(this.searchedNodePathsStore.searchedNodePaths$, { requireSync: true })
    readonly areaMetric = toSignal(this.areaMetricStore.areaMetric$, { requireSync: true })

    readonly isAreaMetricValid = computed(() => isAreaValid(this.node(), this.areaMetric()))
    readonly isSearchResult = computed(() => this.searchedNodePaths().has(this.node().path))
    readonly isFlattenedFile = computed(() => Boolean(this.node().isFlattened) && this.node().type === NodeType.FILE)
}
