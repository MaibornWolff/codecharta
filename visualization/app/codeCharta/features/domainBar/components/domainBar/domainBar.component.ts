import { ChangeDetectionStrategy, Component } from "@angular/core"
import { BAR_BOTTOM_ABOVE_BOTTOM_BAR, BarShellDirective } from "../../../shared/facade"
import { RotationSegmentComponent } from "../rotationSegment/rotationSegment.component"
import { ShapeSegmentComponent } from "../shapeSegment/shapeSegment.component"
import { WordSizingSegmentComponent } from "../wordSizingSegment/wordSizingSegment.component"

/**
 * The domain view's floating settings bar — the word-cloud counterpart of the metricsBar, and composed
 * the same way: one segment per area, each showing its load-bearing value inline and opening its own
 * detail controls (and its own reset) from a cog, so the two views teach the same model. Per-word
 * numbers are not shown here — the cloud's own tooltip reports them for the word under the pointer.
 */
@Component({
    selector: "cc-domain-bar",
    templateUrl: "./domainBar.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ShapeSegmentComponent, WordSizingSegmentComponent, RotationSegmentComponent],
    standalone: true,
    hostDirectives: [BarShellDirective],
    // The domain view mounts no file-extension bar, so only the bottom bar is cleared.
    host: { "[style.bottom]": "barBottom" }
})
export class DomainBarComponent {
    readonly barBottom = BAR_BOTTOM_ABOVE_BOTTOM_BAR
}
