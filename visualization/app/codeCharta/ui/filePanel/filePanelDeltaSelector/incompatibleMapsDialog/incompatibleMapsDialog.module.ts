import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { IncompatibleMapsDialogComponent } from "./incompatibleMapsDialog.component"
import { MaterialModule } from "../../../../../material/material.module"

@NgModule({
    imports: [CommonModule, MaterialModule],
    declarations: [IncompatibleMapsDialogComponent]
})
export class IncompatibleMapsDialogModule {}
