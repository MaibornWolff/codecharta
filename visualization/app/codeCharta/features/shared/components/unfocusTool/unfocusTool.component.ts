import { ChangeDetectionStrategy, Component, input, output } from "@angular/core"
import { BarToolComponent } from "../barTool/barTool.component"

@Component({
    selector: "cc-unfocus-tool",
    template: `<cc-bar-tool
        label="Unfocus"
        icon="fa-solid fa-crosshairs"
        tooltip="Leave the focus and show every folder"
        highlighted
        [revealed]="isFocused()"
        [testId]="testId()"
        (activated)="unfocused.emit()"
    ></cc-bar-tool>`,
    imports: [BarToolComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" }
})
export class UnfocusToolComponent {
    readonly isFocused = input.required<boolean>()
    readonly testId = input.required<string>()

    readonly unfocused = output<void>()
}
