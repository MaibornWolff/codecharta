import { ChangeDetectionStrategy, Component } from "@angular/core"
import { BAR_BOTTOM_ABOVE_BOTTOM_BAR, BarShellDirective } from "../../../shared/facade"
import { EdgeMetricSegmentComponent } from "../edgeMetricSegment/edgeMetricSegment.component"
import { EdgeStyleSegmentComponent } from "../edgeStyleSegment/edgeStyleSegment.component"
import { EdgeTypesSegmentComponent } from "../edgeTypesSegment/edgeTypesSegment.component"
import { GraphViewSegmentComponent } from "../graphViewSegment/graphViewSegment.component"

@Component({
    selector: "cc-dependency-bar",
    templateUrl: "./dependencyBar.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [EdgeTypesSegmentComponent, EdgeStyleSegmentComponent, EdgeMetricSegmentComponent, GraphViewSegmentComponent],
    hostDirectives: [BarShellDirective],
    host: { "[style.bottom]": "barBottom" }
})
export class DependencyBarComponent {
    readonly barBottom = BAR_BOTTOM_ABOVE_BOTTOM_BAR
}
