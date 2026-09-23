import { ChangeDetectionStrategy, Component, input } from "@angular/core"
import { LayoutAlgorithm } from "../../../../model/codeCharta.model"

@Component({
    selector: "cc-layout-glyph",
    templateUrl: "./layoutGlyph.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "inline-block shrink-0" }
})
export class LayoutGlyphComponent {
    readonly layout = input.required<LayoutAlgorithm>()
    protected readonly LayoutAlgorithm = LayoutAlgorithm
}
