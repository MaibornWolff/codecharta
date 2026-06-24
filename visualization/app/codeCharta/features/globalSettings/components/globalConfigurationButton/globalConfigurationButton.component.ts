import { ChangeDetectionStrategy, Component, viewChild } from "@angular/core"
import { GlobalConfigurationDialogComponent } from "../globalConfigurationDialog/globalConfigurationDialog.component"
import { ActionIconComponent } from "../../../../ui/actionIcon/actionIcon.component"

@Component({
    selector: "cc-global-configuration-button",
    templateUrl: "./globalConfigurationButton.component.html",
    imports: [GlobalConfigurationDialogComponent, ActionIconComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalConfigurationButtonComponent {
    dialog = viewChild.required<GlobalConfigurationDialogComponent>("configDialog")

    showGlobalConfiguration() {
        this.dialog().open()
    }
}
