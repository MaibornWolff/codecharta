import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { MaterialModule } from "../../../material/material.module"
import { FilterNodeMetricDataBySearchTermPipe } from "./filterNodeMetricDataBySearchTerm.pipe"
import { MetricChooserComponent } from "./metricChooser.component"
import { MetricChooserValueHoveredModule } from "./metricChooserValueHovered/metricChooserValueHovered.module"

@NgModule({
	imports: [CommonModule, MaterialModule, FormsModule, MetricChooserValueHoveredModule],
	declarations: [MetricChooserComponent, FilterNodeMetricDataBySearchTermPipe],
	exports: [MetricChooserComponent],
	entryComponents: [MetricChooserComponent]
})
export class MetricChooserModule {}
