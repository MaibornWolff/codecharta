import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"

import { MaterialModule } from "../../../../material/material.module"
import { ColorPickerModule } from "../../colorPicker/colorPicker.module"
import { MarkFolderColorPickerComponent } from "./markFolderColorPicker.component"

@NgModule({
	imports: [CommonModule, MaterialModule, ColorPickerModule],
	declarations: [MarkFolderColorPickerComponent],
	exports: [MarkFolderColorPickerComponent]
})
export class MarkFolderColorPickerModule {}
