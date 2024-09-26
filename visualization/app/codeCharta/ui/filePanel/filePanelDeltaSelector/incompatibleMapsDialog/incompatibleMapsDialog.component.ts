import { Component, Inject } from "@angular/core"
import { MAT_DIALOG_DATA } from "@angular/material/dialog"
import { Observable } from "rxjs"

@Component({
    selector: "cc-incompatible-maps-dialog",
    templateUrl: "./incompatibleMapsDialog.component.html"
})
export class IncompatibleMapsDialogComponent {
    changes: Record<string, string>

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { referenceFileName$: Observable<string>; comparisonFileName$: Observable<string> }
    ) {}
}
