import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { Export3DMapButtonComponent } from "./export3DMapButton.component"
import { ActionIconModule } from "../actionIcon/actionIcon.module"
import { HttpClientModule } from "@angular/common/http"

@NgModule({
	imports: [CommonModule, ActionIconModule, HttpClientModule],
	declarations: [Export3DMapButtonComponent],
	exports: [Export3DMapButtonComponent]
})
export class Export3DMapButtonModule {}
