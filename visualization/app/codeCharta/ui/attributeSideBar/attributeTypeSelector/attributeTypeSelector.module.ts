import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"

import { AttributeTypeSelectorComponent } from "./attributeTypeSelector.component"
import { MaterialModule } from "../../../../material/material.module"
import { NodeMetricAggregationTypePipe } from "../../../pipes/nodeMetricAggregationType/nodeMetricAggregationType.pipe"

@NgModule({
	imports: [CommonModule, MaterialModule],
	declarations: [AttributeTypeSelectorComponent, NodeMetricAggregationTypePipe],
	exports: [AttributeTypeSelectorComponent]
})
export class AttributeTypeSelectorModule {}
