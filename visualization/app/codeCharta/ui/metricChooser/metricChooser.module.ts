import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { MaterialModule } from "../../../material/material.module"
import { FilterMetricDataBySearchTermPipe } from "./filterMetricDataBySearchTerm.pipe"
import { MetricChooserComponent } from "./metricChooser.component"

@NgModule({
	imports: [CommonModule, MaterialModule, FormsModule],
	declarations: [MetricChooserComponent, FilterMetricDataBySearchTermPipe],
	exports: [MetricChooserComponent]
})
export class MetricChooserModule {}
