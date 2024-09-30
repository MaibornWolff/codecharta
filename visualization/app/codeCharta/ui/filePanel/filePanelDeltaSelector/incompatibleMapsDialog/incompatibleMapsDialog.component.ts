import { Component, Inject } from "@angular/core"
import { MAT_DIALOG_DATA } from "@angular/material/dialog"
import { MatCheckboxChange } from "@angular/material/checkbox"

export const ALERT_ON_INCOMPATIBLE_MAPS = "alertOnIncompatibleMaps"

@Component({
    selector: "cc-incompatible-maps-dialog",
    templateUrl: "./incompatibleMapsDialog.component.html",
    styleUrls: ["./incompatibleMapsDialog.component.scss"]
})
export class IncompatibleMapsDialogComponent {
    changes: Record<string, string>

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
