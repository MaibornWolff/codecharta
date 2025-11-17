import { Component, input, output } from "@angular/core"
import { ResetSettingsService } from "../../../services/resetSettings.service"

@Component({
    selector: "cc-reset-settings-button",
    templateUrl: "./resetSettingsButton.component.html",
    imports: []
})
export class ResetSettingsButtonComponent {
    settingsKeys = input.required<string[]>()
    tooltip = input<string>()
    label = input<string>()
    callback = output<void>()

    constructor(private readonly resetSettingsService: ResetSettingsService) {}

    applyDefaultSettings() {
        this.resetSettingsService.resetSettings(this.settingsKeys())
        this.callback.emit()
    }
}
