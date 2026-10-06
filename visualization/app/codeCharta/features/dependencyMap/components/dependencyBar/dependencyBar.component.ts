import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, OnDestroy } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { BAR_GAP_PX } from "../../../../util/barLayout"
import { ContainerSizeObserver } from "../../../../util/containerSizeObserver"
import { BAR_BOTTOM_ABOVE_BOTTOM_BAR, BarShellDirective, BarToolsTabComponent } from "../../../shared/facade"
import { DependencyMapReadStore } from "../../stores/dependencyMap.read.store"
import { DependencyMapViewStore } from "../../stores/dependencyMapView.store"
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
export class DependencyBarComponent implements OnDestroy {
    readonly barBottom = BAR_BOTTOM_ABOVE_BOTTOM_BAR
    private readonly readStore = inject(DependencyMapReadStore)
    private readonly viewStore = inject(DependencyMapViewStore)
    private readonly ownSize = new ContainerSizeObserver()

    /** A map without declarations has nothing these settings could change. */
    readonly hasDeclarations = toSignal(this.readStore.hasDeclarations$, { requireSync: true })
    /** Without packages there is one hierarchy only, the folders. */
    readonly hasPackages = toSignal(this.readStore.hasPackages$, { requireSync: true })

    /** The bar floats over the bottom of the graph, a gap above its edge: the graph is told to keep clear of both. */
    constructor() {
        this.ownSize.observe(inject(ElementRef<HTMLElement>).nativeElement)
        effect(() => {
            const { height } = this.ownSize.size()
            this.viewStore.coverBottom(height > 0 ? height + BAR_GAP_PX : 0)
        })
    }

    ngOnDestroy(): void {
        this.ownSize.disconnect()
        this.viewStore.coverBottom(0)
    }
}
