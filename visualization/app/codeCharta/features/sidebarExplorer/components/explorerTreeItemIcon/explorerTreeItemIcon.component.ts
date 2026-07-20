import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { CodeMapNode } from "../../../../model/codeCharta.model"
import { SharedViewReadWindow } from "../../../../stores/sharedView/sharedView.read.facade"
import { getMarkingColor, isLeaf } from "../../../../util/codeMapHelper"

@Component({
    selector: "cc-explorer-tree-item-icon",
    templateUrl: "./explorerTreeItemIcon.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerTreeItemIconComponent {
    private static readonly DEFAULT_FOLDER_COLOR = "#000000"
    private static readonly NO_AREA_COLOR = "#BDBDBD"

    private readonly sharedViewReadWindow = inject(SharedViewReadWindow)

    readonly node = input.required<CodeMapNode>()
    readonly isOpen = input.required<boolean>()
    /** Muted rendering, decided by the hosting view (see ExplorerHost.rowState). */
    readonly isDimmed = input<boolean>(false)

    readonly markedPackages = toSignal(this.sharedViewReadWindow.markedPackages$, { requireSync: true })

    readonly iconClass = computed(() => {
        const node = this.node()
        if (isLeaf(node)) {
            return "fa fa-file-o"
        }
        return this.isOpen() ? "fa fa-folder-open" : "fa fa-folder"
    })

    readonly iconColor = computed((): string | undefined => {
        const node = this.node()
        if (this.isDimmed()) {
            return ExplorerTreeItemIconComponent.NO_AREA_COLOR
        }
        if (isLeaf(node)) {
            return undefined
        }
        const markingColor = getMarkingColor(node, this.markedPackages())
        return markingColor || ExplorerTreeItemIconComponent.DEFAULT_FOLDER_COLOR
    })
}
