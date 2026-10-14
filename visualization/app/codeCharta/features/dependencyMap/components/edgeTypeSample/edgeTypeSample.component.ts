import { ChangeDetectionStrategy, Component, input } from "@angular/core"
import { EDGE_TYPE_DASH } from "../../../../renderer/dependencyGraph/dependencyGraph.facade"

@Component({
    selector: "cc-edge-type-sample",
    templateUrl: "./edgeTypeSample.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "inline-flex shrink-0" }
})
export class EdgeTypeSampleComponent {
    readonly color = input.required<string>()
    readonly isDashed = input.required<boolean>()

    protected readonly dash = EDGE_TYPE_DASH.join(" ")
}
