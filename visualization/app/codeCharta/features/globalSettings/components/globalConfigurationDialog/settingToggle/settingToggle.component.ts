import { Component, input, output } from "@angular/core"

@Component({
    selector: "cc-setting-toggle",
    templateUrl: "./settingToggle.component.html",
    imports: []
})
export class SettingToggleComponent {
    checked = input.required<boolean>()
    label = input.required<string>()

    checkedChange = output<boolean>()

    handleChange(event: Event) {
        const checked = (event.target as HTMLInputElement).checked
        this.checkedChange.emit(checked)
    }
}
