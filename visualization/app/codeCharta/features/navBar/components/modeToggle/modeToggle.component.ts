import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Router } from "@angular/router"
import { routeLinks } from "../../../../routing/routePaths"
import { FileStoreReadWindow } from "../../../../stores/fileStore/fileStore.facade"
import { injectIsSunburstLayout } from "../../../shared/facade"
import { FileSelectionModeService } from "../../services/fileSelectionMode.service"

@Component({
    selector: "cc-mode-toggle",
    templateUrl: "./modeToggle.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModeToggleComponent {
    private readonly fileStoreReadWindow = inject(FileStoreReadWindow)
    private readonly fileSelectionModeService = inject(FileSelectionModeService)
    private readonly router = inject(Router)

    isDeltaState = toSignal(this.fileStoreReadWindow.isDeltaState$, { requireSync: true })
    private readonly isSunburst = injectIsSunburstLayout()
    readonly isCompareOffered = computed(() => !this.isSunburst() || this.isDeltaState())

    selectExplore() {
        this.showMetricsView()
        if (this.isDeltaState()) {
            this.fileSelectionModeService.toggle()
        }
    }

    selectCompare() {
        this.showMetricsView()
        if (!this.isDeltaState()) {
            this.fileSelectionModeService.toggle()
        }
    }

    private showMetricsView() {
        this.router.navigateByUrl(routeLinks.metrics)
    }
}
