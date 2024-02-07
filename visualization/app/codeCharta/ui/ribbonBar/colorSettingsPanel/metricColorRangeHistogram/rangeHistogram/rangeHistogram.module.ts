import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../../../material/material.module"
import { RangeHistogramComponent } from "./rangeHistogram.component"

@NgModule({
	imports: [CommonModule, MaterialModule],
	declarations: [RangeHistogramComponent],
	exports: [RangeHistogramComponent]
})
export class RangeHistogramModule {}
