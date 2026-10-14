import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { DependencyBoxBadge } from "../../../../model/dependencyGraph.model"
import {
    BOX_BADGE_SAMPLE,
    CYCLE_MARK_COLORS,
    pillLookOf,
    type UpwardLine
} from "../../../../renderer/dependencyGraph/dependencyGraph.facade"

const SIZES = BOX_BADGE_SAMPLE
const CENTRE = { x: SIZES.widthPx / 2, y: SIZES.heightPx / 2 }
const PILL = {
    x: SIZES.outlinePx / 2,
    y: SIZES.outlinePx / 2,
    width: SIZES.widthPx - SIZES.outlinePx,
    height: SIZES.heightPx - SIZES.outlinePx,
    cornerRadius: (SIZES.heightPx - SIZES.outlinePx) / 2
}

@Component({
    selector: "cc-box-badge-sample",
    templateUrl: "./boxBadgeSample.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "inline-flex shrink-0" }
})
export class BoxBadgeSampleComponent {
    readonly mark = input.required<DependencyBoxBadge>()
    readonly upwardLine = input.required<UpwardLine>()

    protected readonly pill = computed(() => {
        const mark = this.mark()
        return mark === "declaration" ? null : pillLookOf(mark, this.upwardLine())
    })
    protected readonly ringColors = CYCLE_MARK_COLORS.declaration
    protected readonly dash = computed(() => this.pill()?.lineDash?.join(" ") ?? null)
    protected readonly sizes = SIZES
    protected readonly centre = CENTRE
    protected readonly pillShape = PILL
    protected readonly viewBox = `0 0 ${SIZES.widthPx} ${SIZES.heightPx}`
    /** The glyph sits in the round left end of the pill, which is as wide as the pill is high. */
    protected readonly glyphPlace = `translate(${CENTRE.y} ${CENTRE.y})`
}
