import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MetricChooserTypeComponent } from "./metricChooserType.component"

@NgModule({
    imports: [CommonModule],
    declarations: [MetricChooserTypeComponent],
    exports: [MetricChooserTypeComponent]
})
export class MetricChooserTypeModule {}
