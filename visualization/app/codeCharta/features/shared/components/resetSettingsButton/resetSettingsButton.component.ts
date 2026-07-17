import { ChangeDetectionStrategy, Component, Input } from "@angular/core"
import { ResetSettingsButtonStore } from "../../stores/resetSettingsButton.store"

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

    constructor(private readonly resetSettingsButtonStore: ResetSettingsButtonStore) {}

    applyDefaultSettings() {
        this.resetSettingsButtonStore.resetSettings(this.settingsKeys)

        if (this.callback) {
            this.callback()
        }
    }
}
