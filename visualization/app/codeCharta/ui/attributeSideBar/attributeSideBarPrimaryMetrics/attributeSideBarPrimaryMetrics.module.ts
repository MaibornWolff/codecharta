import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"

import { AttributeTypeSelectorModule } from "../../attributeTypeSelector/attributeTypeSelector.module"
import { AttributeSideBarPrimaryMetricsModule } from "./attributeSideBarPrimaryMetric/attributeSideBarPrimaryMetric.module"
import { AttributeSideBarPrimaryMetricsComponent } from "./attributeSideBarPrimaryMetrics.component"

@NgModule({
	imports: [CommonModule, AttributeTypeSelectorModule, AttributeSideBarPrimaryMetricsModule],
	declarations: [AttributeSideBarPrimaryMetricsComponent],
	exports: [AttributeSideBarPrimaryMetricsComponent]
})
export class AttributeSideBarHeaderPrimaryMetricsModule {}
