import { Component, Inject } from "@angular/core"
import { MAT_DIALOG_DATA } from "@angular/material/dialog"

@Component({
    selector: "cc-incompatible-maps-dialog",
    templateUrl: "./incompatibleMapsDialog.component.html"
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
}
