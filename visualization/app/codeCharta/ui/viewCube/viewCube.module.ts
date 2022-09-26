import { ViewCubeComponent } from "./viewCube.component"
import { CenterMapButtonComponent } from "./centerMapButton/centerMapButton.component"
import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"

@NgModule({
	imports: [CommonModule],
	declarations: [ViewCubeComponent, CenterMapButtonComponent],
	exports: [ViewCubeComponent]
})
export class ViewCubeModule {}
