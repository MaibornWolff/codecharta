import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ViewCubeModule } from "../viewCube/viewCube.module"
import { CodeMapComponent } from "./codeMap.component"
import { AttributeSideBarModule } from "../attributeSideBar/attributeSideBar.module"

@NgModule({
	imports: [CommonModule, ViewCubeModule, AttributeSideBarModule],
	declarations: [CodeMapComponent],
	exports: [CodeMapComponent]
})
export class CodeMapModule {}
