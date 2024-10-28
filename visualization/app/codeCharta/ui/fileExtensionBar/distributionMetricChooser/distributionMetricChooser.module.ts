import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { DistributionMetricChooserComponent } from "./distributionMetricChooser.component"
import { MetricChooserModule } from "../../metricChooser/metricChooser.module"

@NgModule({
    imports: [CommonModule, MetricChooserModule, DistributionMetricChooserComponent],
    exports: [DistributionMetricChooserComponent]
})
export class DistributionMetricChooserModule {}
