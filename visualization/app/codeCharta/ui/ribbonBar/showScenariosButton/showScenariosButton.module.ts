import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { AddCustomScenarioModule } from "./addCustomScenario/addCustomScenario.module"
import { ScenarioService } from "./scenario.service"
import { ScenariosComponent } from "./scenarios/scenarios.component"
import { ShowScenariosButtonComponent } from "./showScenariosButton.component"

@NgModule({
    imports: [CommonModule, MaterialModule, AddCustomScenarioModule],
    providers: [ScenarioService],
    declarations: [ShowScenariosButtonComponent, ScenariosComponent],
    exports: [ShowScenariosButtonComponent]
})
export class ShowScenariosButtonModule {}
