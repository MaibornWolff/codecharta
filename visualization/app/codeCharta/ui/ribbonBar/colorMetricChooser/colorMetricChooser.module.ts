import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MetricChooserModule } from "../../metricChooser/metricChooser.module"
import { MetricChooserValueModule } from "../../metricChooser/metricChooserValue/metricChooserValue.module"
import { ColorMetricChooserComponent } from "./colorMetricChooser.component"

@NgModule({
    imports: [CommonModule, MetricChooserModule, MetricChooserValueModule],
    declarations: [ColorMetricChooserComponent],
    exports: [ColorMetricChooserComponent]
})
export class ColorMetricChooserModule {}
