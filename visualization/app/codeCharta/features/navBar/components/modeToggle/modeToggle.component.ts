import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { FileSelectionModeService } from "../../services/fileSelectionMode.service"
import { FilesSelectionStore } from "../../stores/filesSelection.store"

@Component({
    selector: "cc-mode-toggle",
    templateUrl: "./modeToggle.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModeToggleComponent {
    private readonly filesSelectionStore = inject(FilesSelectionStore)
    private readonly fileSelectionModeService = inject(FileSelectionModeService)

    isDeltaState = toSignal(this.filesSelectionStore.isDeltaState$, { requireSync: true })

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
