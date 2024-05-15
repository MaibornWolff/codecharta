import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"

import { MaterialModule } from "../../../../../material/material.module"
import { FocusButtonsComponent } from "./focusButtons.component"
import { IsNodeFocusedPipe } from "./isNodeFocused.pipe"

@NgModule({
    imports: [CommonModule, MaterialModule],
    declarations: [FocusButtonsComponent, IsNodeFocusedPipe],
    exports: [FocusButtonsComponent]
})
export class FocusButtonsModule {}
