import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { CYCLE_GLYPH, CYCLE_MARK_COLORS, CycleMarkKind } from "../../../../renderer/dependencyGraph/dependencyGraph.facade"

/** A mark the graph puts on what takes part in a cycle, as the graph draws it; decoration beside a text that says it. */
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
}
