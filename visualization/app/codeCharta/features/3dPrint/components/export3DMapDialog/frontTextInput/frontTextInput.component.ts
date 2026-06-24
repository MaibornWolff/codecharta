import { ChangeDetectionStrategy, Component, input, output } from "@angular/core"

@Component({
    selector: "cc-front-text-input",
    templateUrl: "./frontTextInput.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FrontTextInputComponent {
    frontText = input<string>("")

    textChanged = output<string>()

    handleInput(event: Event) {
        const input = event.target as HTMLInputElement
        this.textChanged.emit(input.value)
    }
}
