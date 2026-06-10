import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { CodeMapNode } from "../../../../codeCharta.model"
import { getMarkingColor, isAreaValid, isLeaf } from "../../../../util/codeMapHelper"
import { ExplorerAreaMetricStore } from "../../stores/areaMetric.store"
import { MarkedPackagesStore } from "../../stores/markedPackages.store"

@Component({
    selector: "cc-explorer-tree-item-icon",
    templateUrl: "./explorerTreeItemIcon.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerTreeItemIconComponent {
    private static readonly DEFAULT_FOLDER_COLOR = "#000000"
    private static readonly NO_AREA_COLOR = "#BDBDBD"

    private readonly areaMetricStore = inject(ExplorerAreaMetricStore)
    private readonly markedPackagesStore = inject(MarkedPackagesStore)

    readonly node = input.required<CodeMapNode>()
    readonly isOpen = input.required<boolean>()

    readonly areaMetric = toSignal(this.areaMetricStore.areaMetric$, { requireSync: true })
    readonly markedPackages = toSignal(this.markedPackagesStore.markedPackages$, { requireSync: true })

    readonly iconClass = computed(() => {
        const node = this.node()
        if (isLeaf(node)) {
            return "fa fa-file-o"
        }
        return this.isOpen() ? "fa fa-folder-open" : "fa fa-folder"
    })

    readonly iconColor = computed((): string | undefined => {
        const node = this.node()
        if (!isAreaValid(node, this.areaMetric())) {
            return ExplorerTreeItemIconComponent.NO_AREA_COLOR
        }
        if (isLeaf(node)) {
            return undefined
        }
        const markingColor = getMarkingColor(node, this.markedPackages())
        return markingColor || ExplorerTreeItemIconComponent.DEFAULT_FOLDER_COLOR
    })
}
