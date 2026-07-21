import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { AxisCardComponent } from "../../../shared/facade"

/**
 * One area of the domain bar: a labelled value with a cog that opens its settings popover.
 *
 * All four ids (popover, cog anchor, and the two test ids) are derived from a single `idPrefix` so they
 * cannot drift apart. The popover itself is projected, because each segment has its own — bind it to the
 * exposed `popoverId`/`anchorName` via a template reference variable.
 */
@Component({
    selector: "cc-domain-segment",
    templateUrl: "./domainSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [AxisCardComponent]
})
export class DomainSegmentComponent {
    readonly label = input.required<string>()
    readonly value = input.required<string>()
    readonly idPrefix = input.required<string>()
    readonly minWidthClass = input("min-w-[120px]")

    readonly popoverId = computed(() => `${this.idPrefix()}-popover`)
    readonly anchorName = computed(() => `${this.idPrefix()}-cog`)
    readonly segmentTestId = computed(() => `${this.idPrefix()}-segment`)
    readonly cogTestId = computed(() => `${this.idPrefix()}-cog`)
}
