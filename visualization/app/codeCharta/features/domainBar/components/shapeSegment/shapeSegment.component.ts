import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { AxisCardComponent } from "../../../shared/facade"
import { DomainBarReadStore } from "../../stores/domainBar.read.store"
import { ShapeSettingsPopoverComponent } from "../shapeSettingsPopover/shapeSettingsPopover.component"

/** The domain bar's Shape area: shows the outline the cloud is laid out in, and opens its settings. */
@Component({
    selector: "cc-shape-segment",
    templateUrl: "./shapeSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [AxisCardComponent, ShapeSettingsPopoverComponent]
})
export class ShapeSegmentComponent {
    readonly settingsPopoverId = "domain-bar-shape-popover"
    readonly settingsAnchorName = "domain-bar-shape-cog"

    private readonly readStore = inject(DomainBarReadStore)

    readonly settings = this.readStore.settings
}
