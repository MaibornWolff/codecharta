import { ChangeDetectionStrategy, Component, computed, inject, output } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { InlineColorPickerComponent } from "../../../shared/facade"
import { MarkFolderItem } from "../../selectors/markFolderItems.selector"
import { NodeContextMenuReadStore } from "../../stores/nodeContextMenu.read.store"
import { NodeContextMenuWriteStore } from "../../stores/nodeContextMenu.write.store"

@Component({
    selector: "cc-mark-folder-row",
    templateUrl: "./markFolderRow.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [InlineColorPickerComponent]
})
export class MarkFolderRowComponent {
    private readonly readStore = inject(NodeContextMenuReadStore)
    private readonly writeStore = inject(NodeContextMenuWriteStore)

    readonly folderMarked = output<void>()

    // mark state and node path both derive from the right-clicked node, keeping them in sync
    private readonly rightClickedCodeMapNode = toSignal(this.readStore.rightClickedCodeMapNode$, { requireSync: true })
    readonly nodePath = computed(() => this.rightClickedCodeMapNode()?.path)

    readonly markFolderItems = toSignal(this.readStore.markFolderItems$, { requireSync: true })
    readonly currentMarkColor = toSignal(this.readStore.currentMarkColor$, { requireSync: true })

    // marked with a color picked via the custom picker, so no preset swatch offers the unmark action
    readonly hasCustomMarkColor = computed(
        () => this.currentMarkColor() !== null && !this.markFolderItems().some(markFolderItem => markFolderItem.isMarked)
    )

    onClearColorClick() {
        const nodePath = this.nodePath()
        if (!nodePath) {
            return
        }
        this.writeStore.unmarkFolder(nodePath)
        this.folderMarked.emit()
    }

    onPresetColorClick(markFolderItem: MarkFolderItem) {
        const nodePath = this.nodePath()
        if (!nodePath) {
            return
        }
        if (markFolderItem.isMarked) {
            this.writeStore.unmarkFolder(nodePath)
        } else {
            this.writeStore.markFolder(nodePath, markFolderItem.color)
        }
        this.folderMarked.emit()
    }

    onCustomColorChange(color: string) {
        const nodePath = this.nodePath()
        if (!nodePath) {
            return
        }
        this.writeStore.markFolder(nodePath, color)
    }
}
