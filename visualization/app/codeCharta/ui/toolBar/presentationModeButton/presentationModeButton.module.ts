import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { PresentationModeButtonComponent } from "./presentationModeButton.component"

@NgModule({
	imports: [CommonModule, MaterialModule],
	declarations: [PresentationModeButtonComponent],
	exports: [PresentationModeButtonComponent],
	entryComponents: [PresentationModeButtonComponent]
})
export class PresentationModeButtonModule {}
