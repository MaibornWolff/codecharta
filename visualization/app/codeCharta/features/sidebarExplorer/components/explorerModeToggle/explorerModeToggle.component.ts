import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { ExplorerModeService } from "../../services/explorerMode.service"

@Component({
    selector: "cc-explorer-mode-toggle",
    templateUrl: "./explorerModeToggle.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerModeToggleComponent {
    private readonly modeService = inject(ExplorerModeService)

    readonly modes = this.modeService.modes
    readonly activeMode = this.modeService.activeMode

    activate(modeId: string) {
        this.modeService.activate(modeId)
    }
}
