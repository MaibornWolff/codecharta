import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ViewCubeModule } from "../viewCube/viewCube.module"
import { AttributeSideBarModule } from "../attributeSideBar/attributeSideBar.module"
import { CodeMapComponent } from "./codeMap.component"

@NgModule({
	imports: [CommonModule, ViewCubeModule, AttributeSideBarModule],
	declarations: [CodeMapComponent],
	exports: [CodeMapComponent]
})
export class CodeMapModule {}
