import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core"
import { ContextMenuItemComponent, FloatingMenuAnchor, FloatingMenuComponent, ToastService } from "../../../shared/facade"
import { reportFolderChoice } from "../../services/folderChoiceToast"
import { LocalSourceService } from "../../services/localSource.service"

interface MenuTarget {
    mapFileName: string
    anchor: FloatingMenuAnchor
    hasFolder: boolean
}

// A fixed menu inside a transformed dropdown is placed relative to the dropdown, not the window, so the
// menu is rendered once outside the dropdown instead of in each map's row.
@Component({
    selector: "cc-map-local-folder-menu",
    templateUrl: "./mapLocalFolderMenu.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ContextMenuItemComponent, FloatingMenuComponent]
})
export class MapLocalFolderMenuComponent {
    private readonly localSource = inject(LocalSourceService)
    private readonly toast = inject(ToastService)

    readonly target = signal<MenuTarget | null>(null)

    async openFor(mapFileName: string, event: MouseEvent) {
        if (!this.localSource.isSupported) {
            return
        }
        event.preventDefault()
        const anchor = { x: event.clientX, y: event.clientY }
        const hasFolder = (await this.localSource.describeFolder(mapFileName)) !== null
        this.target.set({ mapFileName, anchor, hasFolder })
    }

    close() {
        this.target.set(null)
    }

    async chooseFolder(mapFileName: string) {
        this.close()
        reportFolderChoice(this.toast, await this.localSource.chooseFolderForMap(mapFileName))
    }

    async forgetFolder(mapFileName: string) {
        this.close()
        await this.localSource.forgetFolder(mapFileName)
    }
}
