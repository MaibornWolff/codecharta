import { Component, viewChild } from "@angular/core"
import { GlobalConfigurationDialogComponent } from "./globalConfigurationDialog/globalConfigurationDialog.component"
import { ActionIconComponent } from "../../actionIcon/actionIcon.component"
import { MatButton } from "@angular/material/button"

@Component({
    selector: "cc-global-configuration-button",
    templateUrl: "./globalConfigurationButton.component.html",
    styleUrl: "./globalConfigurationButton.component.scss",
    imports: [GlobalConfigurationDialogComponent, MatButton, ActionIconComponent]
})
export class GlobalConfigurationButtonComponent {
    dialog = viewChild.required<GlobalConfigurationDialogComponent>("configDialog")

    showGlobalConfiguration() {
        this.dialog().open()
    }
}
