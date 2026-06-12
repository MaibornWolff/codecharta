import { ChangeDetectionStrategy, Component, computed, inject, output } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { InlineColorPickerComponent } from "../../../shared/components/inlineColorPicker/inlineColorPicker.component"
import { MarkFolderItem } from "../../selectors/markFolderItems.selector"
import { MarkFolderStore } from "../../stores/markFolder.store"
import { RightClickedNodeStore } from "../../stores/rightClickedNode.store"

@Component({
    selector: "cc-mark-folder-row",
    templateUrl: "./markFolderRow.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [InlineColorPickerComponent]
})
export class MarkFolderRowComponent {
    private readonly markFolderStore = inject(MarkFolderStore)
    private readonly rightClickedNodeStore = inject(RightClickedNodeStore)

    readonly folderMarked = output<void>()

    // mark state and node path both derive from the right-clicked node, keeping them in sync
    private readonly rightClickedCodeMapNode = toSignal(this.rightClickedNodeStore.rightClickedCodeMapNode$, { requireSync: true })
    readonly nodePath = computed(() => this.rightClickedCodeMapNode()?.path)

    readonly markFolderItems = toSignal(this.markFolderStore.markFolderItems$, { requireSync: true })
    readonly currentMarkColor = toSignal(this.markFolderStore.currentMarkColor$, { requireSync: true })

    // marked with a color picked via the custom picker, so no preset swatch offers the unmark action
    readonly hasCustomMarkColor = computed(
        () => this.currentMarkColor() !== null && !this.markFolderItems().some(markFolderItem => markFolderItem.isMarked)
    )

    onClearColorClick() {
        const nodePath = this.nodePath()
        if (!nodePath) {
            return
        }
        this.markFolderStore.unmarkFolder(nodePath)
        this.folderMarked.emit()
    }

    onPresetColorClick(markFolderItem: MarkFolderItem) {
        const nodePath = this.nodePath()
        if (!nodePath) {
            return
        }
        if (markFolderItem.isMarked) {
            this.markFolderStore.unmarkFolder(nodePath)
        } else {
            this.markFolderStore.markFolder(nodePath, markFolderItem.color)
        }
        this.folderMarked.emit()
    }

    onCustomColorChange(color: string) {
        const nodePath = this.nodePath()
        if (!nodePath) {
            return
        }
        this.markFolderStore.markFolder(nodePath, color)
    }
}
