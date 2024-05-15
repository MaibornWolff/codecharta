import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../../material/material.module"
import { FlattenButtonsComponent } from "./flattenButtons.component"

@NgModule({
    imports: [CommonModule, MaterialModule],
    declarations: [FlattenButtonsComponent],
    exports: [FlattenButtonsComponent]
})
export class FlattenButtonsModule {}
