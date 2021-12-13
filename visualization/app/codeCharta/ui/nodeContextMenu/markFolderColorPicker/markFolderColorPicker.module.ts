import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { ColorChromeModule } from "ngx-color/chrome"

import { MaterialModule } from "../../../../material/material.module"
import { MarkFolderColorPickerComponent } from "./markFolderColorPicker.component"

@NgModule({
	imports: [CommonModule, MaterialModule, ColorChromeModule],
	declarations: [MarkFolderColorPickerComponent],
	exports: [MarkFolderColorPickerComponent]
})
export class MarkFolderColorPickerModule {}
