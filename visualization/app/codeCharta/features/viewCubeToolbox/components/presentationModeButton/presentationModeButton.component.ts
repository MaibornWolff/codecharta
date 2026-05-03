import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { PresentationModeStore } from "../../stores/presentationMode.store"

@Component({
    selector: "cc-toolbox-presentation-mode-button",
    templateUrl: "./presentationModeButton.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PresentationModeButtonComponent {
    private readonly presentationModeStore = inject(PresentationModeStore)

    protected readonly isPresentationMode = toSignal(this.presentationModeStore.presentationMode$, { requireSync: true })

    protected readonly tooltip = computed(() =>
        this.isPresentationMode() ? "Disable flashlight hover effect" : "Enable flashlight hover effect"
    )

    handleToggle() {
        this.presentationModeStore.setPresentationMode(!this.isPresentationMode())
    }
}
