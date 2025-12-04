import { Component, input, output } from "@angular/core"

@Component({
    selector: "cc-second-row-text-input",
    templateUrl: "./secondRowTextInput.component.html"
})
export class SecondRowTextInputComponent {
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
