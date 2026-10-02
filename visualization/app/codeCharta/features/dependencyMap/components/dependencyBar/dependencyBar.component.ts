import { ChangeDetectionStrategy, Component } from "@angular/core"
import { BAR_BOTTOM_ABOVE_BOTTOM_BAR, BarShellDirective, BarToolsTabComponent } from "../../../shared/facade"
import { EdgeMetricSegmentComponent } from "../edgeMetricSegment/edgeMetricSegment.component"
import { EdgeStyleSegmentComponent } from "../edgeStyleSegment/edgeStyleSegment.component"
import { EdgeTypesSegmentComponent } from "../edgeTypesSegment/edgeTypesSegment.component"
import { GraphViewToolsComponent } from "../graphViewTools/graphViewTools.component"
import { LevelLabelSegmentComponent } from "../levelLabelSegment/levelLabelSegment.component"

@Component({
    selector: "cc-dependency-bar",
    templateUrl: "./dependencyBar.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        BarToolsTabComponent,
        EdgeTypesSegmentComponent,
        EdgeStyleSegmentComponent,
        EdgeMetricSegmentComponent,
        GraphViewToolsComponent,
        LevelLabelSegmentComponent
    ],
    hostDirectives: [BarShellDirective],
    host: { "[style.bottom]": "barBottom" }
})
export class DependencyBarComponent {
    readonly barBottom = BAR_BOTTOM_ABOVE_BOTTOM_BAR
}
