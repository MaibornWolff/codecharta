import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"

import { AttributeTypeSelectorModule } from "../../attributeTypeSelector/attributeTypeSelector.module"
import { AttributeSideBarPrimaryMetricModule } from "./attributeSideBarPrimaryMetric/attributeSideBarPrimaryMetric.module"
import { AttributeSideBarPrimaryMetricsComponent } from "./attributeSideBarPrimaryMetrics.component"

@NgModule({
	imports: [CommonModule, AttributeTypeSelectorModule, AttributeSideBarPrimaryMetricModule],
	declarations: [AttributeSideBarPrimaryMetricsComponent],
	exports: [AttributeSideBarPrimaryMetricsComponent]
})
export class AttributeSideBarHeaderPrimaryMetricsModule {}
