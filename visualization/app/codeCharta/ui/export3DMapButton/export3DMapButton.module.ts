import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { Export3DMapButtonComponent } from "./export3DMapButton.component"

import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http"

import { Export3DMapDialogComponent } from "./export3DMapDialog/export3DMapDialog.component"
import { MatSliderModule } from "@angular/material/slider"
import { FormsModule } from "@angular/forms"

@NgModule({
    exports: [Export3DMapButtonComponent],
    imports: [CommonModule, MatSliderModule, FormsModule, Export3DMapButtonComponent, Export3DMapDialogComponent],
    providers: [provideHttpClient(withInterceptorsFromDi())]
})
export class Export3DMapButtonModule {}
