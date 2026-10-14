import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { DependencyBoxBadge } from "../../../../model/dependencyGraph.model"
import {
    BADGE_DASH,
    CYCLE_GLYPH,
    CYCLE_MARK_COLORS,
    CYCLE_MARK_SAMPLE,
    UPWARD_GLYPH,
    type UpwardLine
} from "../../../../renderer/dependencyGraph/dependencyGraph.facade"

const SIZES = CYCLE_MARK_SAMPLE
const CENTRE = { x: SIZES.widthPx / 2, y: SIZES.heightPx / 2 }
const PILL = {
    x: SIZES.outlinePx / 2,
    y: SIZES.outlinePx / 2,
    width: SIZES.widthPx - SIZES.outlinePx,
    height: SIZES.heightPx - SIZES.outlinePx,
    cornerRadius: (SIZES.heightPx - SIZES.outlinePx) / 2
}
const UPWARD_BADGE_FILL = CYCLE_MARK_COLORS.insideFiles.fill

@Component({
    selector: "cc-box-badge-sample",
    templateUrl: "./boxBadgeSample.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "inline-flex shrink-0" }
})
export class BoxBadgeSampleComponent {
    readonly mark = input.required<DependencyBoxBadge>()
    readonly upwardLine = input.required<UpwardLine>()

    protected readonly colors = computed(() => {
        const mark = this.mark()
        return mark === "upward" ? { fill: UPWARD_BADGE_FILL, line: this.upwardLine().color } : CYCLE_MARK_COLORS[mark]
    })
    protected readonly glyph = computed(() => (this.mark() === "upward" ? UPWARD_GLYPH : CYCLE_GLYPH))
    protected readonly dash = computed(() => (this.mark() === "upward" && this.upwardLine().isDashed ? BADGE_DASH.join(" ") : null))
    protected readonly sizes = SIZES
    protected readonly centre = CENTRE
    protected readonly pill = PILL
    protected readonly viewBox = `0 0 ${SIZES.widthPx} ${SIZES.heightPx}`
    /** The glyph sits in the round left end of the pill, which is as wide as the pill is high. */
    protected readonly glyphPlace = `translate(${CENTRE.y} ${CENTRE.y})`
}
