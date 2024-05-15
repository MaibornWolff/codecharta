import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MetricChooserModule } from "../../metricChooser/metricChooser.module"
import { MetricChooserTypeModule } from "../../metricChooser/metricChooserType/metricChooserType.module"
import { EdgeMetricChooserComponent } from "./edgeMetricChooser.component"

@NgModule({
    imports: [CommonModule, MetricChooserModule, MetricChooserTypeModule],
    declarations: [EdgeMetricChooserComponent],
    exports: [EdgeMetricChooserComponent]
})
export class EdgeMetricChooserModule {}
