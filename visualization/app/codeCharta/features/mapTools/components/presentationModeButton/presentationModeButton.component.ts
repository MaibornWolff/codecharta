import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { PreferencesReadWindow } from "../../../../stores/preferences/preferences.read.facade"
import { BarToolComponent } from "../../../shared/facade"
import { MapToolsWriteStore } from "../../stores/mapTools.write.store"

@Component({
    selector: "cc-toolbox-presentation-mode-button",
    templateUrl: "./presentationModeButton.component.html",
    imports: [BarToolComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PresentationModeButtonComponent {
    private readonly preferencesReadWindow = inject(PreferencesReadWindow)
    private readonly mapToolsWriteStore = inject(MapToolsWriteStore)

    protected readonly isPresentationMode = toSignal(this.preferencesReadWindow.isPresentationMode$, { requireSync: true })

    protected readonly tooltip = computed(() =>
        this.isPresentationMode() ? "Disable flashlight hover effect" : "Enable flashlight hover effect"
    )

    handleToggle() {
        this.mapToolsWriteStore.setPresentationMode(!this.isPresentationMode())
    }
}
