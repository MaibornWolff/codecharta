import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { ColorChromeModule } from "ngx-color/chrome"

import { MaterialModule } from "../../../material/material.module"
import { LabelledColorPickerComponent } from "./labelledColorPicker.component"
import { ReadableColorForBackgroundPipe } from "./readableColorForBackground.pipe"

@NgModule({
	imports: [CommonModule, ColorChromeModule, MaterialModule],
	declarations: [LabelledColorPickerComponent, ReadableColorForBackgroundPipe],
	exports: [LabelledColorPickerComponent]
})
export class LabelledColorPickerModule {}
