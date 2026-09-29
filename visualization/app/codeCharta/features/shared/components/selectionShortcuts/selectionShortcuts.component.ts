import { ChangeDetectionStrategy, Component, output } from "@angular/core"

@Component({
    selector: "cc-selection-shortcuts",
    templateUrl: "./selectionShortcuts.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" }
})
export class SelectionShortcutsComponent {
    readonly selectAll = output<void>()
    readonly selectNone = output<void>()
    readonly invert = output<void>()
}
