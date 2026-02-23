import { Component } from "@angular/core"
import { MatMenu, MatMenuTrigger } from "@angular/material/menu"
import { RibbonBarMenuButtonComponent } from "../ribbonBarMenuButton/ribbonBarMenuButton.component"
import { LabelSettingsPanelComponent } from "./labelSettingsPanel.component"

@Component({
    selector: "cc-label-settings",
    templateUrl: "./labelSettings.component.html",
    styleUrl: "./labelSettings.component.scss",
    imports: [RibbonBarMenuButtonComponent, MatMenuTrigger, MatMenu, LabelSettingsPanelComponent]
})
export class LabelSettingsComponent {}
