import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ViewCubeModule } from "../viewCube/viewCube.module"
import { CodeMapComponent } from "./codeMap.component"

@NgModule({
	imports: [CommonModule, ViewCubeModule],
	declarations: [CodeMapComponent],
	exports: [CodeMapComponent]
})
export class CodeMapModule {}
