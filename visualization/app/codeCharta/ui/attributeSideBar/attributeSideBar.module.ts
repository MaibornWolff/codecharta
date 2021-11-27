import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"

import { AttributeSideBarComponent } from "./attributeSideBar.component"
import { AttributeSideBarHeaderSectionModule } from "./attributeSideBarHeaderSection/attributeSideBarHeaderSection.module"
import { AttributeSideBarHeaderPrimaryMetricsModule } from "./attributeSideBarPrimaryMetrics/attributeSideBarPrimaryMetrics.module"
import { AttributeSideBarSecondaryMetricsComponent } from "./attributeSideBarSecondaryMetrics/attributeSideBarSecondaryMetrics.component"
import { AttributeTypeSelectorModule } from "../attributeTypeSelector/attributeTypeSelector.module"
import { MetricDeltaSelectedModule } from "../metricDeltaSelected/metricDeltaSelected.module"

@NgModule({
	imports: [
		CommonModule,
		AttributeSideBarHeaderSectionModule,
		AttributeSideBarHeaderPrimaryMetricsModule,
		AttributeTypeSelectorModule,
		MetricDeltaSelectedModule
	],
	declarations: [AttributeSideBarComponent, AttributeSideBarSecondaryMetricsComponent],
	exports: [AttributeSideBarComponent]
})
export class AttributeSideBarModule {}
