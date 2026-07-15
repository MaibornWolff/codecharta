import { ChangeDetectionStrategy, Component, viewChild } from "@angular/core"
import { GlobalConfigurationDialogComponent } from "../../../globalSettings/facade"

@Component({
    selector: "cc-settings-button",
    templateUrl: "./settingsButton.component.html",
    imports: [GlobalConfigurationDialogComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsButtonComponent {
    dialog = viewChild.required<GlobalConfigurationDialogComponent>("configDialog")

    showSettings() {
        this.dialog().open()
    }
}
