import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { MaterialModule } from "../../../material/material.module"
import { FilterMetricDataBySearchTermPipe } from "./filterMetricDataBySearchTerm.pipe"
import { MetricChooserComponent } from "./metricChooser.component"
import { SimplePipesModule } from "../../util/simplePipes/SimplePipesModule"

@NgModule({
	declarations: [MetricChooserComponent, FilterMetricDataBySearchTermPipe],
	exports: [MetricChooserComponent],
	imports: [CommonModule, MaterialModule, FormsModule, SimplePipesModule]
})
export class MetricChooserModule {}
