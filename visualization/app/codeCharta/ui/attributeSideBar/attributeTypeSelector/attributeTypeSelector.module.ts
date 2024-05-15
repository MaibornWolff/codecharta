import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"

import { AttributeTypeSelectorComponent } from "./attributeTypeSelector.component"
import { MaterialModule } from "../../../../material/material.module"

@NgModule({
    imports: [CommonModule, MaterialModule],
    declarations: [AttributeTypeSelectorComponent],
    exports: [AttributeTypeSelectorComponent]
})
export class AttributeTypeSelectorModule {}
