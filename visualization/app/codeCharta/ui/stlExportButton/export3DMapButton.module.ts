import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { Export3DMapButtonComponent } from "./export3DMapButton.component"
import { MaterialModule } from "../../../material/material.module"

@NgModule({
	imports: [CommonModule, MaterialModule],
	declarations: [Export3DMapButtonComponent],
	exports: [Export3DMapButtonComponent]
})
export class Export3DMapButtonModule {}
