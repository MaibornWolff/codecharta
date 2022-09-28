import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { CoupleHeightAndColorMetricButtonComponent } from "./coupleHeightAndColorMetricButton.component"

@NgModule({
	imports: [CommonModule, MaterialModule],
	declarations: [CoupleHeightAndColorMetricButtonComponent],
	exports: [CoupleHeightAndColorMetricButtonComponent]
})
export class CoupleHeightAndColorMetricButtonModule {}
