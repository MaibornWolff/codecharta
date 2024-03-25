import { Component, ViewEncapsulation } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { Export3DMapDialogComponent } from "./export3DMapDialog/export3DMapDialog.component"

@Component({
	selector: "cc-export-threed-map-button",
	templateUrl: "./export3DMapButton.component.html",
	encapsulation: ViewEncapsulation.None
})
export class Export3DMapButtonComponent {
	constructor(private dialog: MatDialog) {}

	export3DMap() {
		this.dialog.open(Export3DMapDialogComponent, {
			panelClass: ".cc-export-3D-map-dialog"
		})
	}
}
