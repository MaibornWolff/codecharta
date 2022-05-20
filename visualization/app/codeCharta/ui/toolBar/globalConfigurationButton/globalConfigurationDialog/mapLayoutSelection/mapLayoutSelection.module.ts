import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../../../material/material.module"
import { MapLayoutSelectionComponent } from "./mapLayoutSelection.component"

@NgModule({
	imports: [CommonModule, MaterialModule],
	declarations: [MapLayoutSelectionComponent],
	exports: [MapLayoutSelectionComponent]
})
export class MapLayoutSelectionModule {}
