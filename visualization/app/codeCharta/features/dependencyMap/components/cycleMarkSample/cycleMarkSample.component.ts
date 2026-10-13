import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import {
    CYCLE_GLYPH,
    CYCLE_MARK_COLORS,
    CYCLE_MARK_SAMPLE,
    CycleMarkKind
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

@Component({
    selector: "cc-cycle-mark-sample",
    templateUrl: "./cycleMarkSample.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "inline-flex shrink-0" }
})
export class CycleMarkSampleComponent {
    readonly mark = input.required<CycleMarkKind>()

    protected readonly colors = computed(() => CYCLE_MARK_COLORS[this.mark()])
    protected readonly glyph = CYCLE_GLYPH
    protected readonly sizes = SIZES
    protected readonly centre = CENTRE
    protected readonly pill = PILL
    protected readonly viewBox = `0 0 ${SIZES.widthPx} ${SIZES.heightPx}`
    /** The glyph sits in the round left end of the pill, which is as wide as the pill is high. */
    protected readonly glyphPlace = `translate(${CENTRE.y} ${CENTRE.y})`
}
