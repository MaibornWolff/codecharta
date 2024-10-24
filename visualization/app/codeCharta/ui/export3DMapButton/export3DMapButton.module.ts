import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { Export3DMapButtonComponent } from "./export3DMapButton.component"
import { ActionIconModule } from "../actionIcon/actionIcon.module"
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http"
import { MaterialModule } from "../../../material/material.module"
import { Export3DMapDialogComponent } from "./export3DMapDialog/export3DMapDialog.component"
import { MatSliderModule } from "@angular/material/slider"
import { FormsModule } from "@angular/forms"
import { LabelledColorPickerModule } from "../labelledColorPicker/labelledColorPicker.module"

@NgModule({
    declarations: [Export3DMapButtonComponent, Export3DMapDialogComponent],
    exports: [Export3DMapButtonComponent],
    imports: [CommonModule, ActionIconModule, MaterialModule, MatSliderModule, FormsModule, LabelledColorPickerModule],
    providers: [provideHttpClient(withInterceptorsFromDi())]
})
export class Export3DMapButtonModule {}
