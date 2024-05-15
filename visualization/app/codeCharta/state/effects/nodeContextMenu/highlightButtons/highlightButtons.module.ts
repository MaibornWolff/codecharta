import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../../material/material.module"
import { HighlightButtonsComponent } from "./highlightButtons.component"

@NgModule({
    imports: [CommonModule, MaterialModule],
    declarations: [HighlightButtonsComponent],
    exports: [HighlightButtonsComponent]
})
export class HighlightButtonsModule {}
