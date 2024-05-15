import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"

import { LabelledColorPickerModule } from "../labelledColorPicker/labelledColorPicker.module"
import { ColorPickerForMapColorComponent } from "./colorPickerForMapColor.component"
import { MapColorLabelPipe } from "./mapColorLabel.pipe"

@NgModule({
    imports: [CommonModule, LabelledColorPickerModule],
    declarations: [ColorPickerForMapColorComponent, MapColorLabelPipe],
    exports: [ColorPickerForMapColorComponent]
})
export class ColorPickerForMapColorModule {}
