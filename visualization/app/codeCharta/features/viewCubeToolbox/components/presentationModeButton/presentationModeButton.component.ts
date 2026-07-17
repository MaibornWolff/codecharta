import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { PreferencesReadWindow } from "../../../../stores/preferences/preferences.read.facade"
import { ViewCubeToolboxWriteStore } from "../../stores/viewCubeToolbox.write.store"

@Component({
    selector: "cc-toolbox-presentation-mode-button",
    templateUrl: "./presentationModeButton.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PresentationModeButtonComponent {
    private readonly preferencesReadWindow = inject(PreferencesReadWindow)
    private readonly viewCubeToolboxWriteStore = inject(ViewCubeToolboxWriteStore)

    protected readonly isPresentationMode = toSignal(this.preferencesReadWindow.isPresentationMode$, { requireSync: true })

    protected readonly tooltip = computed(() =>
        this.isPresentationMode() ? "Disable flashlight hover effect" : "Enable flashlight hover effect"
    )

    handleToggle() {
        this.viewCubeToolboxWriteStore.setPresentationMode(!this.isPresentationMode())
    }
}
