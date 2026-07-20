import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { AxisCardComponent } from "../../../shared/facade"
import { DomainBarReadStore } from "../../stores/domainBar.read.store"
import { RotationSettingsPopoverComponent } from "../rotationSettingsPopover/rotationSettingsPopover.component"

/** The domain bar's Rotation area: the angles words may be drawn at, summarized as the current range. */
@Component({
    selector: "cc-rotation-segment",
    templateUrl: "./rotationSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [AxisCardComponent, RotationSettingsPopoverComponent]
})
export class RotationSegmentComponent {
    readonly settingsPopoverId = "domain-bar-rotation-popover"
    readonly settingsAnchorName = "domain-bar-rotation-cog"

    private readonly readStore = inject(DomainBarReadStore)

    readonly settings = this.readStore.settings

    readonly rotationRangeLabel = computed(() => {
        const [minRotation, maxRotation] = this.settings().rotationRange
        return `${minRotation}° – ${maxRotation}°`
    })
}
