import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { AddCustomScenarioComponent } from "./addCustomScenario.component"

@NgModule({
	imports: [CommonModule, MaterialModule],
	declarations: [AddCustomScenarioComponent],
	entryComponents: [AddCustomScenarioComponent]
})
export class AddCustomScenarioModule {}
