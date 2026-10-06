import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { edgeTypesCarriedBy } from "../../../../lenses/dependency/dependencyLens.facade"
import { DependencyEdgeType } from "../../../../model/dependencyGraph.model"
import { edgeLegend } from "../../../../renderer/dependencyGraph/dependencyGraph.facade"
import {
    AxisCardComponent,
    InlineColorPickerComponent,
    ResetSettingsButtonComponent,
    SelectionShortcutsComponent,
    SettingsPopoverShellComponent
} from "../../../shared/facade"
import { DependencyMapReadStore } from "../../stores/dependencyMap.read.store"
import { DependencyMapWriteStore } from "../../stores/dependencyMap.write.store"
import { invertedEdgeTypes, nameOfShownEdgeTypes, withAllEdgeTypes, withoutEdgeTypes } from "./shownEdgeTypes"

@Component({
    selector: "cc-edge-types-segment",
    templateUrl: "./edgeTypesSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [
        AxisCardComponent,
        InlineColorPickerComponent,
        ResetSettingsButtonComponent,
        SettingsPopoverShellComponent,
        SelectionShortcutsComponent
    ]
})
export class EdgeTypesSegmentComponent {
    private readonly readStore = inject(DependencyMapReadStore)
    private readonly writeStore = inject(DependencyMapWriteStore)
    private readonly edgeMetric = toSignal(this.readStore.sharedEdgeMetric$, { requireSync: true })
    private readonly settings = toSignal(this.readStore.persistedSettings$, { requireSync: true })

    readonly popoverId = "dependency-bar-edges-popover"
    readonly anchorName = "dependency-bar-edges-card"
    readonly colorResetKeys = ["preferences.dependencyGraph.edgeColors"]

    private readonly carriedTypes = computed(() => edgeTypesCarriedBy(this.edgeMetric()))
    private readonly shownTypes = computed(() => this.settings().shownEdgeTypes)

    readonly entries = computed(() =>
        edgeLegend(this.settings().edgeColors, this.settings().lineStyleShows).map(entry => {
            const isCarried = this.carriedTypes().includes(entry.type)
            return { ...entry, isCarried, isShown: isCarried && this.shownTypes().includes(entry.type) }
        })
    )
    readonly chosenLabel = computed(() => nameOfShownEdgeTypes(this.shownTypes(), this.carriedTypes()))

    toggle(type: DependencyEdgeType, isShown: boolean): void {
        this.show(isShown ? withAllEdgeTypes(this.shownTypes(), [type]) : withoutEdgeTypes(this.shownTypes(), [type]))
    }

    showAll(): void {
        this.show(withAllEdgeTypes(this.shownTypes(), this.carriedTypes()))
    }

    showNone(): void {
        this.show(withoutEdgeTypes(this.shownTypes(), this.carriedTypes()))
    }

    invert(): void {
        this.show(invertedEdgeTypes(this.shownTypes(), this.carriedTypes()))
    }

    recolor(type: DependencyEdgeType, color: string): void {
        this.writeStore.changeSettings({ edgeColors: { ...this.settings().edgeColors, [type]: color } })
    }

    private show(shownEdgeTypes: DependencyEdgeType[]): void {
        this.writeStore.changeSettings({ shownEdgeTypes })
    }
}
