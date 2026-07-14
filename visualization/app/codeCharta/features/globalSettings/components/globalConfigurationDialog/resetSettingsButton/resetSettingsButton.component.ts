import { ChangeDetectionStrategy, Component, inject, input, output } from "@angular/core"
import { ResetSettingsStore } from "../../../stores/resetSettings.store"

@Component({
    selector: "cc-reset-settings-button",
    templateUrl: "./resetSettingsButton.component.html",
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetSettingsButtonComponent {
    private readonly resetSettingsStore = inject(ResetSettingsStore)

    settingsKeys = input.required<string[]>()
    tooltip = input<string>()
    label = input<string>()
    callback = output<void>()

    applyDefaultSettings() {
        this.resetSettingsStore.resetSettings(this.settingsKeys())
        this.callback.emit()
    }
}
