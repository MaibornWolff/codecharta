import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"

import { AttributeTypeSelectorComponent } from "./attributeTypeSelector.component"
import { MaterialModule } from "../../../../material/material.module"
import { AggregationTypePipePipe } from "./aggregationType.pipe"

@NgModule({
	imports: [CommonModule, MaterialModule],
	declarations: [AttributeTypeSelectorComponent, AggregationTypePipePipe],
	exports: [AttributeTypeSelectorComponent]
})
export class AttributeTypeSelectorModule {}
