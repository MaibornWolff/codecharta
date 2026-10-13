import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { DependencyEdgeThickness, LineStyleMeaning } from "../../../../model/dependencyGraph.model"
import { ResetSettingsButtonComponent, SliderNumberInputComponent } from "../../../shared/facade"
import { DependencyMapReadStore } from "../../stores/dependencyMap.read.store"
import { DependencyMapWriteStore } from "../../stores/dependencyMap.write.store"
import { ChoiceRowComponent } from "../choiceRow/choiceRow.component"
import { EDGE_THICKNESS_CHOICES, LINE_STYLE_MEANING_CHOICES } from "../edgeStyleSegment/edgeStyleChoices"

const EDGE_WIDTH_FACTOR_RANGE = { min: 0.25, max: 3, step: 0.25 }

@Component({
    selector: "cc-edge-line-settings",
    templateUrl: "./edgeLineSettings.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "flex flex-col gap-2.5 border-t border-base-300 pt-2.5" },
    imports: [ChoiceRowComponent, ResetSettingsButtonComponent, SliderNumberInputComponent]
})
export class EdgeLineSettingsComponent {
    private readonly writeStore = inject(DependencyMapWriteStore)
    private readonly settings = toSignal(inject(DependencyMapReadStore).persistedSettings$, { requireSync: true })

    readonly edgeThicknessChoices = EDGE_THICKNESS_CHOICES
    readonly lineStyleMeaningChoices = LINE_STYLE_MEANING_CHOICES
    readonly widthFactorRange = EDGE_WIDTH_FACTOR_RANGE
    readonly resetKeys = [
        "preferences.dependencyGraph.edgeStyle",
        "preferences.dependencyGraph.edgeShape",
        "preferences.dependencyGraph.isAnchoredAtSideMiddle",
        "preferences.dependencyGraph.edgeWidth",
        "preferences.dependencyGraph.lineStyleShows"
    ]

    readonly edgeWidth = computed(() => this.settings().edgeWidth)
    readonly lineStyleShows = computed(() => this.settings().lineStyleShows)

    drawEdgesThick(thickness: DependencyEdgeThickness): void {
        this.writeStore.changeSettings({ edgeWidth: { ...this.edgeWidth(), thickness } })
    }

    scaleEdgeWidth(factor: number): void {
        this.writeStore.changeSettings({ edgeWidth: { ...this.edgeWidth(), factor } })
    }

    setLineStyleMeaning(lineStyleShows: LineStyleMeaning): void {
        this.writeStore.changeSettings({ lineStyleShows })
    }
}
