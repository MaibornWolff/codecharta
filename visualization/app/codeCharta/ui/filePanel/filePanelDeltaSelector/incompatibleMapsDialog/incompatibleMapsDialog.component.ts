import { Component, Inject } from "@angular/core"
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogActions, MatDialogClose } from "@angular/material/dialog"
import { MatCheckboxChange, MatCheckbox } from "@angular/material/checkbox"
import { MatToolbar } from "@angular/material/toolbar"
import { CdkScrollable } from "@angular/cdk/scrolling"
import { MatButton } from "@angular/material/button"

export const ALERT_ON_INCOMPATIBLE_MAPS = "alertOnIncompatibleMaps"

@Component({
    selector: "cc-incompatible-maps-dialog",
    templateUrl: "./incompatibleMapsDialog.component.html",
    styleUrls: ["./incompatibleMapsDialog.component.scss"],
    standalone: true,
    imports: [MatToolbar, CdkScrollable, MatDialogContent, MatCheckbox, MatDialogActions, MatButton, MatDialogClose]
})
export class IncompatibleMapsDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: {
            referenceFileName: string
            comparisonFileName: string
            fileWithMccMetric: string
        }
    ) {}

    setDoNotAlertOnIncompatibleMaps($event: MatCheckboxChange) {
        localStorage.setItem(ALERT_ON_INCOMPATIBLE_MAPS, JSON.stringify(!$event.checked))
    }
}
