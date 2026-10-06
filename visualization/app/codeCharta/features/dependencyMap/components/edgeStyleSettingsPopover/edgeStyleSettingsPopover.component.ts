import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { DependencyEdgeThickness, LineStyleMeaning } from "../../../../model/dependencyGraph.model"
import { ResetSettingsButtonComponent, SettingsPopoverShellComponent, SliderNumberInputComponent } from "../../../shared/facade"
import { DependencyMapReadStore } from "../../stores/dependencyMap.read.store"
import { DependencyMapWriteStore } from "../../stores/dependencyMap.write.store"
import { ChoiceRowComponent } from "../choiceRow/choiceRow.component"
import { EDGE_THICKNESS_CHOICES, LINE_STYLE_MEANING_CHOICES } from "../edgeStyleSegment/edgeStyleChoices"

const EDGE_WIDTH_FACTOR_RANGE = { min: 0.25, max: 3, step: 0.25 }

@Component({
    selector: "cc-edge-style-settings-popover",
    templateUrl: "./edgeStyleSettingsPopover.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [ChoiceRowComponent, ResetSettingsButtonComponent, SettingsPopoverShellComponent, SliderNumberInputComponent]
})
export class EdgeStyleSettingsPopoverComponent {
    private readonly writeStore = inject(DependencyMapWriteStore)
    private readonly settings = toSignal(inject(DependencyMapReadStore).persistedSettings$, { requireSync: true })

    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()

    readonly edgeThicknessChoices = EDGE_THICKNESS_CHOICES
    readonly lineStyleMeaningChoices = LINE_STYLE_MEANING_CHOICES
    readonly widthFactorRange = EDGE_WIDTH_FACTOR_RANGE
    readonly resetKeys = [
        "preferences.dependencyGraph.edgeStyle",
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

    showByLineStyle(lineStyleShows: LineStyleMeaning): void {
        this.writeStore.changeSettings({ lineStyleShows })
    }
}
