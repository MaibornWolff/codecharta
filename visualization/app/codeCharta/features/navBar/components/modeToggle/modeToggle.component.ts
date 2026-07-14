import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { FileStoreReadWindow } from "../../../../stores/fileStore/fileStore.facade"
import { FileSelectionModeService } from "../../services/fileSelectionMode.service"

@Component({
    selector: "cc-mode-toggle",
    templateUrl: "./modeToggle.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModeToggleComponent {
    private readonly fileStoreReadWindow = inject(FileStoreReadWindow)
    private readonly fileSelectionModeService = inject(FileSelectionModeService)

    isDeltaState = toSignal(this.fileStoreReadWindow.isDeltaState$, { requireSync: true })

    selectExplore() {
        if (this.isDeltaState()) {
            this.fileSelectionModeService.toggle()
        }
    }

    selectCompare() {
        if (!this.isDeltaState()) {
            this.fileSelectionModeService.toggle()
        }
    }
}
