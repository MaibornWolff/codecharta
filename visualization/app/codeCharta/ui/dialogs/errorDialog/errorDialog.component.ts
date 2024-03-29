import { Component, Inject, ViewEncapsulation } from "@angular/core"
import { MAT_DIALOG_DATA } from "@angular/material/dialog"

@Component({
	templateUrl: "./errorDialog.component.html",
	encapsulation: ViewEncapsulation.None
})
export class ErrorDialogComponent {
	constructor(
		@Inject(MAT_DIALOG_DATA)
		public data: { title: string; message: string; resolveErrorData?: { buttonText: string; onResolveErrorClick: () => void } }
	) {}
}
