import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { MaterialModule } from "../../../material/material.module"
import { AttributeDescriptorTooltipPipeModule } from "../../util/pipes/AttributeDescriptorTooltipPipeModule"
import { FilterMetricDataBySearchTermPipe } from "./filterMetricDataBySearchTerm.pipe"
import { MetricChooserComponent } from "./metricChooser.component"
import { NodeSelectionService } from "./nodeSelection.service"

@NgModule({
	declarations: [MetricChooserComponent, FilterMetricDataBySearchTermPipe],
	exports: [MetricChooserComponent],
	imports: [CommonModule, MaterialModule, FormsModule, AttributeDescriptorTooltipPipeModule],
	providers: [NodeSelectionService]
})
export class MetricChooserModule {}
