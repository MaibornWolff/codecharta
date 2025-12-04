import { Component, input, output } from "@angular/core"

@Component({
    selector: "cc-qr-code-settings",
    templateUrl: "./qrCodeSettings.component.html"
})
export class QrCodeSettingsComponent {
    isVisible = input.required<boolean>()
    currentText = input<string>("")

    visibilityChanged = output<boolean>()
    textChanged = output<string>()

    handleToggleChange(event: Event) {
        const input = event.target as HTMLInputElement
        this.visibilityChanged.emit(input.checked)
    }

    handleTextInput(event: Event) {
        const input = event.target as HTMLInputElement
        this.textChanged.emit(input.value)
    }
}
