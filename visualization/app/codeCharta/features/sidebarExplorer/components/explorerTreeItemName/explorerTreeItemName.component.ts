import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { CodeMapNode, NodeType } from "../../../../model/codeCharta.model"
import { isAreaValid } from "../../../../util/codeMapHelper"
import { MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"
import { SearchedNodePathsStore } from "../../stores/searchedNodePaths.store"

@Component({
    selector: "cc-explorer-tree-item-name",
    templateUrl: "./explorerTreeItemName.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerTreeItemNameComponent {
    private readonly mapStateReadWindow = inject(MapStateReadWindow)
    private readonly searchedNodePathsStore = inject(SearchedNodePathsStore)

    readonly node = input.required<CodeMapNode>()
    readonly isUnclickable = input<boolean>(false)

    readonly searchedNodePaths = toSignal(this.searchedNodePathsStore.searchedNodePaths$, { requireSync: true })
    readonly areaMetric = toSignal(this.mapStateReadWindow.areaMetric$, { requireSync: true })

    readonly isAreaMetricValid = computed(() => isAreaValid(this.node(), this.areaMetric()))
    readonly isSearchResult = computed(() => this.searchedNodePaths().has(this.node().path))
    readonly isFlattenedFile = computed(() => Boolean(this.node().isFlattened) && this.node().type === NodeType.FILE)
}
