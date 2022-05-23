import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { DistributionMetricChooserComponent } from "./distributionMetricChooser.component"

@NgModule({
	imports: [CommonModule, MaterialModule],
	declarations: [DistributionMetricChooserComponent],
	exports: [DistributionMetricChooserComponent],
	entryComponents: [DistributionMetricChooserComponent]
})
export class DistributionMetricChooserModule {}
