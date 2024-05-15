import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { LoadingMapProgressSpinnerComponent } from "./loadingMapProgressSpinner.component"

@NgModule({
    imports: [CommonModule, MaterialModule],
    declarations: [LoadingMapProgressSpinnerComponent],
    exports: [LoadingMapProgressSpinnerComponent]
})
export class LoadingMapProgressSpinnerModule {}
