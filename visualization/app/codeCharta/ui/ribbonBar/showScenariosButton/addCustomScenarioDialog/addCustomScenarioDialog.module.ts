import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { MaterialModule } from "../../../../../material/material.module"
import { AddCustomScenarioDialogComponent } from "./addCustomScenarioDialog.component"

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
    declarations: [AddCustomScenarioDialogComponent]
})
export class AddCustomScenarioDialogModule {}
