import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../material/material.module"
import { SliderComponent } from "./slider.component"

@NgModule({
	imports: [MaterialModule, CommonModule],
	declarations: [SliderComponent],
	exports: [SliderComponent]
})
export class SliderModule {}
