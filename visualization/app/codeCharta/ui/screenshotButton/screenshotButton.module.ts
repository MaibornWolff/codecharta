import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { ActionIconModule } from "../actionIcon/actionIcon.module"
import { ScreenshotButtonComponent } from "./screenshotButton.component"
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
	imports: [CommonModule, ActionIconModule, MatSnackBarModule],
	declarations: [ScreenshotButtonComponent],
	exports: [ScreenshotButtonComponent]
})
export class ScreenshotButtonModule {}
