import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { RibbonBarButtonModule } from "../ribbonBarButton/ribbonBarButton.module"
import { MetricTemplatesComponent } from "./metricTemplates.component"

@NgModule({
	imports: [CommonModule, MaterialModule, RibbonBarButtonModule],
	declarations: [MetricTemplatesComponent],
	exports: [MetricTemplatesComponent],
	entryComponents: [MetricTemplatesComponent]
})
export class MetricTemplatesModule {}
