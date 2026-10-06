import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { BAR_BOTTOM_ABOVE_BOTTOM_BAR, BarShellDirective, BarToolsTabComponent } from "../../../shared/facade"
import { DependencyMapReadStore } from "../../stores/dependencyMap.read.store"
import { DeclarationsSegmentComponent } from "../declarationsSegment/declarationsSegment.component"
import { EdgeMetricSegmentComponent } from "../edgeMetricSegment/edgeMetricSegment.component"
import { EdgeStyleSegmentComponent } from "../edgeStyleSegment/edgeStyleSegment.component"
import { EdgeTypesSegmentComponent } from "../edgeTypesSegment/edgeTypesSegment.component"
import { GraphViewToolsComponent } from "../graphViewTools/graphViewTools.component"
import { HierarchySegmentComponent } from "../hierarchySegment/hierarchySegment.component"
import { LevelLabelSegmentComponent } from "../levelLabelSegment/levelLabelSegment.component"

@Component({
    selector: "cc-dependency-bar",
    templateUrl: "./dependencyBar.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        BarToolsTabComponent,
        DeclarationsSegmentComponent,
        EdgeTypesSegmentComponent,
        EdgeStyleSegmentComponent,
        EdgeMetricSegmentComponent,
        GraphViewToolsComponent,
        HierarchySegmentComponent,
        LevelLabelSegmentComponent
    ],
    hostDirectives: [BarShellDirective],
    host: { "[style.bottom]": "barBottom" }
})
export class DependencyBarComponent {
    readonly barBottom = BAR_BOTTOM_ABOVE_BOTTOM_BAR
    private readonly readStore = inject(DependencyMapReadStore)

    /** A map without declarations has nothing these settings could change. */
    readonly hasDeclarations = toSignal(this.readStore.hasDeclarations$, { requireSync: true })
    /** Without packages there is one hierarchy only, the folders. */
    readonly hasNamespaces = toSignal(this.readStore.hasNamespaces$, { requireSync: true })
}
