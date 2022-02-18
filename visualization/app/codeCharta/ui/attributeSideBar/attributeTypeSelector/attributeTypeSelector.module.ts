import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"

import { AttributeTypeSelectorComponent } from "./attributeTypeSelector.component"
import { MaterialModule } from "../../../../material/material.module"
import { AggregationTypePipe } from "./aggregationType.pipe"

@NgModule({
	imports: [CommonModule, MaterialModule],
	declarations: [AttributeTypeSelectorComponent, AggregationTypePipe],
	exports: [AttributeTypeSelectorComponent]
})
export class AttributeTypeSelectorModule {}
