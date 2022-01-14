import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"

import { ColorPickerModule } from "../../colorPicker/colorPicker.module"
import { MarkFolderColorPickerComponent } from "./markFolderColorPicker.component"

@NgModule({
	imports: [CommonModule, ColorPickerModule],
	declarations: [MarkFolderColorPickerComponent],
	exports: [MarkFolderColorPickerComponent]
})
export class MarkFolderColorPickerModule {}
