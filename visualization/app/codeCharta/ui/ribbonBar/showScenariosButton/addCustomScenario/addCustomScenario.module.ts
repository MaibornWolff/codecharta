import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { MaterialModule } from "../../../../../material/material.module"
import { AddCustomScenarioComponent } from "./addCustomScenario.component"

@NgModule({
	imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
	declarations: [AddCustomScenarioComponent],
	entryComponents: [AddCustomScenarioComponent]
})
export class AddCustomScenarioModule {}
