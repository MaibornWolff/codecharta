import { ChangeDetectionStrategy, Component, viewChild } from "@angular/core"
import { ConfirmResetMapDialogComponent } from "../confirmResetMapDialog/confirmResetMapDialog.component"

@Component({
    selector: "cc-reset-map-button",
    templateUrl: "./resetMapButton.component.html",
    imports: [ConfirmResetMapDialogComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetMapButtonComponent {
    readonly confirmDialog = viewChild.required<ConfirmResetMapDialogComponent>("confirmDialog")

    handleClick() {
        this.confirmDialog().open()
    }
}
