import { Component, viewChild } from "@angular/core"
import { GlobalConfigurationDialogComponent } from "./globalConfigurationDialog/globalConfigurationDialog.component"
import { ActionIconComponent } from "../../../ui/actionIcon/actionIcon.component"

@Component({
    selector: "cc-global-configuration-button",
    templateUrl: "./globalConfigurationButton.component.html",
    styleUrl: "./globalConfigurationButton.component.scss",
    imports: [GlobalConfigurationDialogComponent, ActionIconComponent]
})
export class GlobalConfigurationButtonComponent {
    dialog = viewChild.required<GlobalConfigurationDialogComponent>("configDialog")

    showGlobalConfiguration() {
        this.dialog().open()
    }
}
