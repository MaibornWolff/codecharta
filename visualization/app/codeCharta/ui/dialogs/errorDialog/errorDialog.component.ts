import { Component, Inject } from "@angular/core"
import { MAT_DIALOG_DATA } from "@angular/material/dialog"

@Component({
    selector: "cc-error-dialog",
    templateUrl: "./errorDialog.component.html"
})
export class ErrorDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: { title: string; message: string; resolveErrorData?: { buttonText: string; onResolveErrorClick: () => void } }
    ) {}
}
