import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { ColorChromeModule } from "ngx-color/chrome"

import { MaterialModule } from "../../../material/material.module"
import { ColorPickerComponent } from "./colorPicker.component"

@NgModule({
    imports: [CommonModule, ColorChromeModule, MaterialModule],
    declarations: [ColorPickerComponent],
    exports: [ColorPickerComponent]
})
export class ColorPickerModule {}
