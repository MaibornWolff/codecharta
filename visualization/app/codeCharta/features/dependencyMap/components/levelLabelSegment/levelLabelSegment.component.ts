import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { DependencyLevelLabel } from "../../../../model/dependencyGraph.model"
import { AxisCardComponent } from "../../../shared/facade"
import { DependencyMapReadStore } from "../../stores/dependencyMap.read.store"
import { DependencyMapWriteStore } from "../../stores/dependencyMap.write.store"
import { ChoiceListPopoverComponent } from "../choiceListPopover/choiceListPopover.component"
import { Choice } from "../choiceRow/choiceRow.component"
import { labelOf } from "../edgeStyleSegment/edgeStyleChoices"

const LEVEL_LABEL_CHOICES: Choice<DependencyLevelLabel>[] = [
    { value: "number", label: "Number", hint: "Each level by its own number, as in level 2" },
    { value: "path", label: "Path", hint: "The levels of the folders around it first, as in level 0.1.2" }
]

@Component({
    selector: "cc-level-label-segment",
    templateUrl: "./levelLabelSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [AxisCardComponent, ChoiceListPopoverComponent]
})
export class LevelLabelSegmentComponent {
    private readonly writeStore = inject(DependencyMapWriteStore)
    private readonly readStore = inject(DependencyMapReadStore)
    private readonly settings = toSignal(this.readStore.persistedSettings$, { requireSync: true })

    readonly popoverId = "dependency-bar-level-label-popover"
    readonly anchorName = "dependency-bar-level-label-card"
    readonly levelLabelChoices = LEVEL_LABEL_CHOICES

    readonly levelLabel = computed(() => this.settings().levelLabel)
    readonly chosenLabel = computed(() => labelOf(LEVEL_LABEL_CHOICES, this.levelLabel()))
    /** Cycles are found between declarations, so a map without them has none to count. */
    readonly hasDeclarations = toSignal(this.readStore.hasDeclarations$, { requireSync: true })
    readonly showsCycleBadges = computed(() => this.settings().showsCycleBadges)

    labelLevelsBy(levelLabel: DependencyLevelLabel): void {
        this.writeStore.changeSettings({ levelLabel })
    }

    showCycleBadges(showsCycleBadges: boolean): void {
        this.writeStore.changeSettings({ showsCycleBadges })
    }
}
