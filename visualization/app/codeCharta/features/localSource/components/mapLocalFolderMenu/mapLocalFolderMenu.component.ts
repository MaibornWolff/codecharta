import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from "@angular/core"
import { ContextMenuItemComponent, FloatingMenuAnchor, FloatingMenuComponent, ToastService } from "../../../shared/facade"
import { reportFolderChoice } from "../../services/folderChoiceToast"
import { LocalSourceService } from "../../services/localSource.service"
import { EditorFolderDialogComponent } from "../editorFolderDialog/editorFolderDialog.component"

interface MenuTarget {
    mapFileName: string
    anchor: FloatingMenuAnchor
}

// A fixed menu inside a transformed dropdown is placed relative to the dropdown, not the window, so the
// menu is rendered once outside the dropdown instead of in each map's row.
@Component({
    selector: "cc-map-local-folder-menu",
    templateUrl: "./mapLocalFolderMenu.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ContextMenuItemComponent, EditorFolderDialogComponent, FloatingMenuComponent]
})
export class MapLocalFolderMenuComponent {
    private readonly localSource = inject(LocalSourceService)
    private readonly toast = inject(ToastService)
    private readonly editorFolderDialog = viewChild.required(EditorFolderDialogComponent)

    readonly target = signal<MenuTarget | null>(null)

    openFor(mapFileName: string, event: MouseEvent) {
        if (!this.localSource.isAvailable()) {
            return
        }
        event.preventDefault()
        this.target.set({ mapFileName, anchor: { x: event.clientX, y: event.clientY } })
    }

    close() {
        this.target.set(null)
    }

    async chooseFolder(mapFileName: string) {
        this.close()
        reportFolderChoice(this.toast, await this.localSource.chooseFolderForMap(mapFileName))
    }

    async setEditorFolder(mapFileName: string) {
        this.close()
        const folder = await this.localSource.describeFolder(mapFileName)
        this.editorFolderDialog().ask({ mapFileName, editorRootPath: folder?.editorRootPath ?? null, fileToOpen: null })
    }
}
