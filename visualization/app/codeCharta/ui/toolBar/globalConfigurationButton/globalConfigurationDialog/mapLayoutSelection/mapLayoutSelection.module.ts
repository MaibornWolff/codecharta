import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../../../material/material.module"
import { SliderModule } from "../../../../slider/slider.module"
import { MapLayoutSelectionComponent } from "./mapLayoutSelection.component"

@NgModule({
    imports: [CommonModule, MaterialModule, SliderModule],
    declarations: [MapLayoutSelectionComponent],
    exports: [MapLayoutSelectionComponent]
})
export class MapLayoutSelectionModule {}
