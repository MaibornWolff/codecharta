import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { CodeMapNode } from "../../../../model/codeCharta.model"
import { isLeaf } from "../../../../util/codeMapHelper"

@Component({
    selector: "cc-explorer-tree-item-icon",
    templateUrl: "./explorerTreeItemIcon.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerTreeItemIconComponent {
    private static readonly DEFAULT_FOLDER_COLOR = "#000000"
    private static readonly NO_AREA_COLOR = "#BDBDBD"

    readonly node = input.required<CodeMapNode>()
    readonly isOpen = input.required<boolean>()
    readonly isInactive = input<boolean>(false)
    readonly markingColor = input<string | null>(null)

    readonly iconClass = computed(() => {
        const node = this.node()
        if (isLeaf(node)) {
            return "fa fa-file-o"
        }
        return this.isOpen() ? "fa fa-folder-open" : "fa fa-folder"
    })

    readonly iconColor = computed((): string | undefined => {
        if (this.isInactive()) {
            return ExplorerTreeItemIconComponent.NO_AREA_COLOR
        }
        if (isLeaf(this.node())) {
            return undefined
        }
        return this.markingColor() ?? ExplorerTreeItemIconComponent.DEFAULT_FOLDER_COLOR
    })
}
