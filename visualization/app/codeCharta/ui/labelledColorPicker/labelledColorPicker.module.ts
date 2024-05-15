import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"

import { ColorPickerModule } from "../colorPicker/colorPicker.module"
import { LabelledColorPickerComponent } from "./labelledColorPicker.component"
import { ReadableColorForBackgroundPipe } from "./readableColorForBackground.pipe"

@NgModule({
    imports: [CommonModule, ColorPickerModule],
    declarations: [LabelledColorPickerComponent, ReadableColorForBackgroundPipe],
    exports: [LabelledColorPickerComponent]
})
export class LabelledColorPickerModule {}
