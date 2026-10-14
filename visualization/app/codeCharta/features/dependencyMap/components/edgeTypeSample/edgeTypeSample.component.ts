import { ChangeDetectionStrategy, Component, input } from "@angular/core"

/** A short stroke in the colour of an edge type, dashed where the graph dashes it. */
@Component({
    selector: "cc-edge-type-sample",
    templateUrl: "./edgeTypeSample.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "inline-flex shrink-0" }
})
export class EdgeTypeSampleComponent {
    readonly color = input.required<string>()
    readonly isDashed = input.required<boolean>()
}
