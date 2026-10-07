import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { canAnchorAtSideMiddle, canDrawStraight, DependencyEdgeShape, DependencyEdgeStyle } from "../../../../model/dependencyGraph.model"
import { AxisCardComponent } from "../../../shared/facade"
import { DependencyMapReadStore } from "../../stores/dependencyMap.read.store"
import { DependencyMapWriteStore } from "../../stores/dependencyMap.write.store"
import { ChoiceListPopoverComponent } from "../choiceListPopover/choiceListPopover.component"
import { ChoiceRowComponent } from "../choiceRow/choiceRow.component"
import { EdgeStyleSettingsPopoverComponent } from "../edgeStyleSettingsPopover/edgeStyleSettingsPopover.component"
import { EDGE_SHAPE_CHOICES, EDGE_STYLE_CHOICES, EDGE_THICKNESS_CHOICES, labelOf } from "./edgeStyleChoices"

@Component({
    selector: "cc-edge-style-segment",
    templateUrl: "./edgeStyleSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [AxisCardComponent, ChoiceListPopoverComponent, ChoiceRowComponent, EdgeStyleSettingsPopoverComponent]
})
export class EdgeStyleSegmentComponent {
    private readonly writeStore = inject(DependencyMapWriteStore)
    private readonly settings = toSignal(inject(DependencyMapReadStore).persistedSettings$, { requireSync: true })

    readonly stylePopoverId = "dependency-bar-edge-style-popover"
    readonly styleAnchorName = "dependency-bar-edge-style-card"
    readonly settingsPopoverId = "dependency-bar-edge-style-settings-popover"
    readonly settingsAnchorName = "dependency-bar-edge-style-cog"
    readonly edgeStyleChoices = EDGE_STYLE_CHOICES
    readonly edgeShapeChoices = EDGE_SHAPE_CHOICES

    readonly edgeStyle = computed(() => this.settings().edgeStyle)
    readonly edgeStyleLabel = computed(() => labelOf(EDGE_STYLE_CHOICES, this.edgeStyle()))
    readonly edgeThicknessLabel = computed(() => labelOf(EDGE_THICKNESS_CHOICES, this.settings().edgeWidth.thickness))
    readonly edgeShape = computed(() => this.settings().edgeShape)
    readonly canDrawStraight = computed(() => canDrawStraight(this.edgeStyle()))
    readonly canAnchorAtSideMiddle = computed(() => canAnchorAtSideMiddle(this.edgeStyle()))
    readonly isAnchoredAtSideMiddle = computed(() => this.settings().isAnchoredAtSideMiddle)

    drawEdgesAs(edgeStyle: DependencyEdgeStyle): void {
        this.writeStore.changeSettings({ edgeStyle })
    }

    shapeEdges(edgeShape: DependencyEdgeShape): void {
        this.writeStore.changeSettings({ edgeShape })
    }

    anchorAtSideMiddle(isAnchoredAtSideMiddle: boolean): void {
        this.writeStore.changeSettings({ isAnchoredAtSideMiddle })
    }
}
