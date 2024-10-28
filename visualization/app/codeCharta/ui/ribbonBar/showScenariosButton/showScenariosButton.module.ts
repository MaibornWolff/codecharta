import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"

import { ScenarioService } from "./scenario.service"
import { ScenariosComponent } from "./scenarios/scenarios.component"
import { ShowScenariosButtonComponent } from "./showScenariosButton.component"

@NgModule({
    imports: [CommonModule, ShowScenariosButtonComponent, ScenariosComponent],
    providers: [ScenarioService],
    exports: [ShowScenariosButtonComponent]
})
export class ShowScenariosButtonModule {}
