import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { LinkHeightAndColorMetricButtonComponent } from "./linkHeightAndColorMetricButton.component"

@NgModule({
	imports: [CommonModule, MaterialModule],
	declarations: [LinkHeightAndColorMetricButtonComponent],
	exports: [LinkHeightAndColorMetricButtonComponent]
})
export class CoupleHeightAndColorMetricButtonModule {}
