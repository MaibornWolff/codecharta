import { NgModule } from "@angular/core"
import { RibbonBarPanelComponent } from "./ribbonBarPanel.component"
import { MaterialModule } from "../../../../material/material.module"
import { RibbonBarPanelSettingsComponent } from "./ribbonBarPanelSettings.component"

@NgModule({
    imports: [MaterialModule],
    declarations: [RibbonBarPanelComponent, RibbonBarPanelSettingsComponent],
    exports: [RibbonBarPanelComponent, RibbonBarPanelSettingsComponent]
})
export class RibbonBarPanelModule {}
