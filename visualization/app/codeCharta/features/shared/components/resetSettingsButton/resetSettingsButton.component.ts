import { ChangeDetectionStrategy, Component, Input } from "@angular/core"
import { ResetSettingsButtonService } from "../../services/resetSettingsButton.service"

@Component({
    selector: "cc-reset-settings-button",
    templateUrl: "./resetSettingsButton.component.html",
    standalone: true,
    host: { class: "contents" },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetSettingsButtonComponent {
    @Input() settingsKeys: string[]
    @Input() tooltip?: string
    @Input() label?: string
    @Input() callback?: () => void
    @Input() small = false

    constructor(private readonly resetSettingsButtonService: ResetSettingsButtonService) {}

    applyDefaultSettings() {
        this.resetSettingsButtonService.resetSettings(this.settingsKeys)

        if (this.callback) {
            this.callback()
        }
    }
}
