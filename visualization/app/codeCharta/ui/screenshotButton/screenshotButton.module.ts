import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { ActionIconModule } from "../actionIcon/actionIcon.module"
import { ScreenshotButtonComponent } from "./screenshotButton.component"

@NgModule({
	imports: [CommonModule, ActionIconModule],
	declarations: [ScreenshotButtonComponent],
	exports: [ScreenshotButtonComponent]
})
export class ScreenshotButtonModule {}
