import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MetricChooserModule } from "../../metricChooser/metricChooser.module"
import { ColorMetricChooserComponent } from "./colorMetricChooser.component"

@NgModule({
    imports: [CommonModule, MetricChooserModule],
    declarations: [ColorMetricChooserComponent],
    exports: [ColorMetricChooserComponent]
})
export class ColorMetricChooserModule {}
