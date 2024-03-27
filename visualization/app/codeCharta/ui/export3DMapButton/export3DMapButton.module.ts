import {CommonModule} from "@angular/common"
import {NgModule} from "@angular/core"
import {Export3DMapButtonComponent} from "./export3DMapButton.component"
import {ActionIconModule} from "../actionIcon/actionIcon.module"
import {HttpClientModule} from "@angular/common/http"
import {MaterialModule} from "../../../material/material.module"
import {Export3DMapDialogComponent} from "./export3DMapDialog/export3DMapDialog.component"
import {MatSliderModule} from "@angular/material/slider";
import {FormsModule} from "@angular/forms";

@NgModule({
	imports: [CommonModule, ActionIconModule, HttpClientModule, MaterialModule, MatSliderModule, FormsModule],
	declarations: [Export3DMapButtonComponent, Export3DMapDialogComponent],
	exports: [Export3DMapButtonComponent]
})
export class Export3DMapButtonModule {
}
