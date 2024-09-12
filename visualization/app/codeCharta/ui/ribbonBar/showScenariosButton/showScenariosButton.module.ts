import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { AddCustomScenarioDialogModule } from "./addCustomScenarioDialog/addCustomScenarioDialog.module"
import { ScenarioService } from "./scenario.service"
import { ScenariosComponent } from "./scenarios/scenarios.component"
import { ShowScenariosButtonComponent } from "./showScenariosButton.component"
import { RibbonBarMenuButtonModule } from "../ribbonBarMenuButton/ribbonBarMenuButton.module"

@NgModule({
    imports: [CommonModule, MaterialModule, AddCustomScenarioDialogModule, RibbonBarMenuButtonModule],
    providers: [ScenarioService],
    declarations: [ShowScenariosButtonComponent, ScenariosComponent],
    exports: [ShowScenariosButtonComponent]
})
export class ShowScenariosButtonModule {}
