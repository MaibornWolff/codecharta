import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { ColorChromeModule } from "ngx-color/chrome"
import { ColorPickerComponent } from "./colorPicker.component"

@NgModule({
	imports: [CommonModule, ColorChromeModule],
	declarations: [ColorPickerComponent],
	exports: [ColorPickerComponent]
})
export class ColorPickerModule {}
