import { Component, Inject } from "@angular/core"
import { MAT_DIALOG_DATA } from "@angular/material/dialog"

@Component({
	template: require("./errorDialog.component.html")
})
export class ErrorDialogComponent {
	constructor(@Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }) {}
}
