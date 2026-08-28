import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { Export3DMapDialogStore } from "../../../3dPrint/facade"

@Component({
    selector: "cc-print-3d-button",
    templateUrl: "./print3DButton.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Print3DButtonComponent {
    private readonly export3DMapDialogStore = inject(Export3DMapDialogStore)

    /** Stays clickable outside the metric view: the store then offers to switch there and continue,
     * which is more useful than a dead button. */
    export3DMap() {
        this.export3DMapDialogStore.requestExport()
    }
}
