import { ViewCubeComponent } from "./viewCube.component"
import { CenterMapButtonComponent } from "./centerMapButton/centerMapButton.component"
import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ZoomSliderComponent } from "./zoom-slider/zoomSlider.component"

@NgModule({
    imports: [CommonModule],
    declarations: [ViewCubeComponent, CenterMapButtonComponent, ZoomSliderComponent],
    exports: [ViewCubeComponent]
})
export class ViewCubeModule {}
