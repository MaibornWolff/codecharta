import { ChangeDetectionStrategy, Component, viewChild } from "@angular/core"
import { ActionIconComponent } from "../../../../features/shared/components/actionIcon/actionIcon.component"
import { GlobalConfigurationDialogComponent } from "../globalConfigurationDialog/globalConfigurationDialog.component"

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
