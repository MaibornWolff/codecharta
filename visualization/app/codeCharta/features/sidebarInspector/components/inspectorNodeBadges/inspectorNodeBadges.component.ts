import { ChangeDetectionStrategy, Component, input } from "@angular/core"
import { FileCount } from "../../../../codeCharta.model"

@Component({
    selector: "cc-inspector-node-badges",
    templateUrl: "./inspectorNodeBadges.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "mt-1 flex flex-wrap items-center gap-1", "data-testid": "inspector-node-badges" }
})
export class InspectorNodeBadgesComponent {
    readonly isFolder = input.required<boolean>()
    readonly fileCount = input<FileCount | undefined>()
    readonly isDeltaState = input.required<boolean>()
}
