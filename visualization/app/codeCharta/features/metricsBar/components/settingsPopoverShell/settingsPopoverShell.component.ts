import { ChangeDetectionStrategy, Component, input } from "@angular/core"

@Component({
    selector: "cc-settings-popover-shell",
    templateUrl: "./settingsPopoverShell.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" }
})
export class SettingsPopoverShellComponent {
    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()
    readonly widthClass = input<string>("w-72")
    readonly testId = input<string | null>(null)
}
