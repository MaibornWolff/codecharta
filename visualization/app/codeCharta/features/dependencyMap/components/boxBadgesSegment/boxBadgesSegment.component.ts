import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { DEPENDENCY_BOX_BADGES, DependencyBoxBadge } from "../../../../model/dependencyGraph.model"
import { CYCLE_MARK_LEGEND } from "../../../../renderer/dependencyGraph/dependencyGraph.facade"
import {
    AxisCardComponent,
    ResetSettingsButtonComponent,
    SelectionShortcutsComponent,
    SettingsPopoverShellComponent
} from "../../../shared/facade"
import { DependencyMapReadStore } from "../../stores/dependencyMap.read.store"
import { DependencyMapWriteStore } from "../../stores/dependencyMap.write.store"
import { CycleMarkSampleComponent } from "../cycleMarkSample/cycleMarkSample.component"
import { invertedBoxBadges, nameOfShownBoxBadges, withBoxBadge } from "./shownBoxBadges"

@Component({
    selector: "cc-box-badges-segment",
    templateUrl: "./boxBadgesSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [
        AxisCardComponent,
        CycleMarkSampleComponent,
        ResetSettingsButtonComponent,
        SelectionShortcutsComponent,
        SettingsPopoverShellComponent
    ]
})
export class BoxBadgesSegmentComponent {
    private readonly writeStore = inject(DependencyMapWriteStore)
    private readonly readStore = inject(DependencyMapReadStore)
    private readonly settings = toSignal(this.readStore.persistedSettings$, { requireSync: true })

    readonly popoverId = "dependency-bar-box-badges-popover"
    readonly anchorName = "dependency-bar-box-badges-card"
    readonly resetKeys = ["preferences.dependencyGraph.shownBoxBadges"]

    private readonly shownBadges = computed(() => this.settings().shownBoxBadges)
    readonly entries = computed(() => CYCLE_MARK_LEGEND.map(entry => ({ ...entry, isShown: this.shownBadges().includes(entry.mark) })))
    readonly chosenLabel = computed(() => nameOfShownBoxBadges(this.shownBadges(), CYCLE_MARK_LEGEND))

    toggle(badge: DependencyBoxBadge, isShown: boolean): void {
        this.show(withBoxBadge(this.shownBadges(), badge, isShown))
    }

    showAll(): void {
        this.show([...DEPENDENCY_BOX_BADGES])
    }

    showNone(): void {
        this.show([])
    }

    invert(): void {
        this.show(invertedBoxBadges(this.shownBadges()))
    }

    private show(shownBoxBadges: DependencyBoxBadge[]): void {
        this.writeStore.changeSettings({ shownBoxBadges })
    }
}
