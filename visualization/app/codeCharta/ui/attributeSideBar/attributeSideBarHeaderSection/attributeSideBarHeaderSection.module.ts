import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"

import { MaterialModule } from "../../../../material/material.module"
import { AttributeSideBarHeaderSectionComponent } from "./attributeSideBarHeaderSection.component"
import { NodePathComponent } from "./nodePath/nodePath.component"

@NgModule({
	imports: [CommonModule, MaterialModule],
	declarations: [NodePathComponent, AttributeSideBarHeaderSectionComponent],
	exports: [AttributeSideBarHeaderSectionComponent]
})
export class AttributeSideBarHeaderSectionModule {}
