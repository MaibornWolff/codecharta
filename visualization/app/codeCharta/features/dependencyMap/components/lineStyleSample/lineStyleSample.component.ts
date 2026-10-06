import { ChangeDetectionStrategy, Component, input } from "@angular/core"
import { LineStyle } from "../../../../renderer/dependencyGraph/dependencyGraph.facade"

/** A short edge in the dashes and with the arrowhead of a kind of use, as the graph draws it. */
@Component({
    selector: "cc-line-style-sample",
    templateUrl: "./lineStyleSample.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "inline-flex shrink-0" }
})
export class LineStyleSampleComponent {
    readonly line = input.required<Pick<LineStyle, "dash" | "head">>()
    readonly color = input.required<string>()
    /** What a screen reader says of the edge; without it the sample is decoration beside a text that says it. */
    readonly label = input<string | null>(null)
}
