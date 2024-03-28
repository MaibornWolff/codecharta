import { Component, ViewEncapsulation } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { Export3DMapDialogComponent } from "./export3DMapDialog/export3DMapDialog.component"
import { State } from "@ngrx/store"
import { CcState, ColorMode } from "../../codeCharta.model"
import { colorModeSelector } from "../../state/store/dynamicSettings/colorMode/colorMode.selector"
import { take } from "rxjs"
import { ErrorDialogComponent } from "../dialogs/errorDialog/errorDialog.component"

@Component({
	selector: "cc-export-threed-map-button",
	templateUrl: "./export3DMapButton.component.html",
	encapsulation: ViewEncapsulation.None
})
export class Export3DMapButtonComponent {
	constructor(private dialog: MatDialog, private state: State<CcState>) {}

	export3DMap() {
		const colorMode: ColorMode = this.state.getValue().dynamicSettings.colorMode
		if (colorMode !== ColorMode.absolute) {
			this.dialog.open(ErrorDialogComponent, {
				data: this.buildErrorDialog()
			})
		} else {
			this.dialog.open(Export3DMapDialogComponent, {
				panelClass: ".cc-export-3D-map-dialog"
			})
		}
	}

	buildErrorDialog(): { title; message } {
		const title = "Map could not be exported"
		const message =
			"<p>3D map can only be exported when <strong>color mode</strong> is set to <strong>absolute</strong>.<br>" +
			'<i class="fa fa-info-circle"></i> You can change this under Color Metric Options.<p>'

		return { title, message }
	}
}
