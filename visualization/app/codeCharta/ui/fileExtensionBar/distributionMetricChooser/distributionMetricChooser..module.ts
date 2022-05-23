import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { MaterialModule } from "../../../../material/material.module"
import { DistributionMetricChooserComponent } from "./distributionMetricChooser.component"
import { FilterNodeMetricDataBySearchTermPipe } from "./filterNodeMetricDataBySearchTerm.pipe"

@NgModule({
	imports: [CommonModule, MaterialModule, FormsModule],
	declarations: [DistributionMetricChooserComponent, FilterNodeMetricDataBySearchTermPipe],
	exports: [DistributionMetricChooserComponent],
	entryComponents: [DistributionMetricChooserComponent]
})
export class DistributionMetricChooserModule {}
