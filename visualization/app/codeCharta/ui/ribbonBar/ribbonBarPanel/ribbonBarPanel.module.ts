import { NgModule } from "@angular/core"
import { RibbonBarPanelComponent } from "./ribbonBarPanel.component"
import { MaterialModule } from "app/material/material.module"
import { RibbonBarPanelExpandableContentComponent } from "./ribbonBarPanelExpandableComponent"

@NgModule({
    imports: [MaterialModule],
    declarations: [RibbonBarPanelComponent, RibbonBarPanelExpandableContentComponent],
    exports: [RibbonBarPanelComponent, RibbonBarPanelExpandableContentComponent]
})
export class RibbonBarPanelModule {}
