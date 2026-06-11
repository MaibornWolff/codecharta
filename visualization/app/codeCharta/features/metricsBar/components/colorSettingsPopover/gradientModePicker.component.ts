import { ChangeDetectionStrategy, Component, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { ColorMode } from "../../../../codeCharta.model"
import { ColorModeService } from "../../services/colorMode.service"

@Component({
    selector: "cc-gradient-mode-picker",
    templateUrl: "./gradientModePicker.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" }
})
export class GradientModePickerComponent {
    constructor(private readonly colorModeService: ColorModeService) {}

    /** Unique radio group name, so multiple popovers in the DOM cannot cross-link. */
    readonly groupName = input.required<string>()

    readonly colorMode = toSignal(this.colorModeService.colorMode$(), { initialValue: "absolute" as ColorMode })

    handleColorModeChange(value: string) {
        this.colorModeService.setColorMode(value as ColorMode)
    }
}
