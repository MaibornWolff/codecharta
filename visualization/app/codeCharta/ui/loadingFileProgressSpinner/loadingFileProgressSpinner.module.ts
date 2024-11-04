import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../material/material.module"
import { LoadingFileProgressSpinnerComponent } from "./loadingFileProgressSpinner.component"

@NgModule({
    imports: [CommonModule, MaterialModule],
    declarations: [LoadingFileProgressSpinnerComponent],
    exports: [LoadingFileProgressSpinnerComponent]
})
export class LoadingFileProgressSpinnerModule {}
