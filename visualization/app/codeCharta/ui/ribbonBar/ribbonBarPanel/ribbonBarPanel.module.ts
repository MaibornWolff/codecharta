import { NgModule } from "@angular/core"
import { RibbonBarPanelComponent } from "./ribbonBarPanel.component"
import { MaterialModule } from "app/material/material.module"
import { RibbonBarPanelSettingsComponent } from "./ribbonBarPanelSettingsComponent"

@NgModule({
    imports: [MaterialModule],
    declarations: [RibbonBarPanelComponent, RibbonBarPanelSettingsComponent],
    exports: [RibbonBarPanelComponent, RibbonBarPanelSettingsComponent]
})
export class RibbonBarPanelModule {}
