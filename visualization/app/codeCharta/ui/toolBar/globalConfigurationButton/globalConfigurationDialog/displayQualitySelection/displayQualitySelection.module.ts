import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../../../material/material.module"
import { DisplayQualitySelectionComponent } from "./displayQualitySelection.component"

@NgModule({
    imports: [CommonModule, MaterialModule],
    declarations: [DisplayQualitySelectionComponent],
    exports: [DisplayQualitySelectionComponent]
})
export class DisplayQualitySelectionModule {}
