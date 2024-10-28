import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { FormsModule } from "@angular/forms"

import { FilterMetricDataBySearchTermPipe } from "./filterMetricDataBySearchTerm.pipe"
import { MetricChooserComponent } from "./metricChooser.component"
import { NodeSelectionService } from "./nodeSelection.service"

@NgModule({
    exports: [MetricChooserComponent],
    imports: [CommonModule, FormsModule, MetricChooserComponent, FilterMetricDataBySearchTermPipe],
    providers: [NodeSelectionService]
})
export class MetricChooserModule {}
