import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { DependencyEdgeStyle, DependencyEdgeThickness } from "../../../../model/dependencyGraph.model"
import {
    AxisCardComponent,
    ResetSettingsButtonComponent,
    SettingsPopoverShellComponent,
    SliderNumberInputComponent
} from "../../../shared/facade"
import { DependencyMapReadStore } from "../../stores/dependencyMap.read.store"
import { DependencyMapWriteStore } from "../../stores/dependencyMap.write.store"
import { Choice, ChoiceRowComponent } from "../choiceRow/choiceRow.component"

const EDGE_STYLE_CHOICES: Choice<DependencyEdgeStyle>[] = [
    { value: "curved", label: "Curved", hint: "Leave and enter each box square to its side" },
    { value: "spread", label: "Spread", hint: "Curved, each edge with its own spot on the box" },
    { value: "upwardAside", label: "Upward aside", hint: "Upward edges bow out to the right of the boxes" },
    { value: "straight", label: "Straight", hint: "A straight line from box to box" }
]

const EDGE_THICKNESS_CHOICES: Choice<DependencyEdgeThickness>[] = [
    { value: "byCount", label: "By count", hint: "Width grows with the dependencies an edge stands for" },
    { value: "thin", label: "Thin", hint: "Every edge a hairline, easiest to see through" },
    { value: "uniform", label: "Uniform", hint: "Every edge the same width" },
    { value: "strong", label: "Strong", hint: "Grows with the dependencies, twice as pronounced" }
]

const EDGE_WIDTH_FACTOR_RANGE = { min: 0.25, max: 3, step: 0.25 }

@Component({
    selector: "cc-edge-style-segment",
    templateUrl: "./edgeStyleSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [
        AxisCardComponent,
        ChoiceRowComponent,
        ResetSettingsButtonComponent,
        SettingsPopoverShellComponent,
        SliderNumberInputComponent
    ]
})
export class EdgeStyleSegmentComponent {
    private readonly writeStore = inject(DependencyMapWriteStore)
    private readonly settings = toSignal(inject(DependencyMapReadStore).persistedSettings$, { requireSync: true })

    readonly popoverId = "dependency-bar-edge-style-popover"
    readonly anchorName = "dependency-bar-edge-style-card"
    readonly edgeStyleChoices = EDGE_STYLE_CHOICES
    readonly edgeThicknessChoices = EDGE_THICKNESS_CHOICES
    readonly widthFactorRange = EDGE_WIDTH_FACTOR_RANGE
    readonly resetKeys = [
        "preferences.dependencyGraph.edgeStyle",
        "preferences.dependencyGraph.isAnchoredAtSideMiddle",
        "preferences.dependencyGraph.edgeWidth"
    ]

    readonly edgeStyle = computed(() => this.settings().edgeStyle)
    readonly isAnchoredAtSideMiddle = computed(() => this.settings().isAnchoredAtSideMiddle)
    readonly edgeWidth = computed(() => this.settings().edgeWidth)
    readonly edgeStyleLabel = computed(() => labelOf(EDGE_STYLE_CHOICES, this.edgeStyle()))
    readonly edgeThicknessLabel = computed(() => labelOf(EDGE_THICKNESS_CHOICES, this.edgeWidth().thickness))

    drawEdgesAs(edgeStyle: DependencyEdgeStyle): void {
        this.writeStore.changeSettings({ edgeStyle })
    }

    anchorAtSideMiddle(isAnchoredAtSideMiddle: boolean): void {
        this.writeStore.changeSettings({ isAnchoredAtSideMiddle })
    }

    drawEdgesThick(thickness: DependencyEdgeThickness): void {
        this.writeStore.changeSettings({ edgeWidth: { ...this.edgeWidth(), thickness } })
    }

    scaleEdgeWidth(factor: number): void {
        this.writeStore.changeSettings({ edgeWidth: { ...this.edgeWidth(), factor } })
    }
}

function labelOf<Value extends string>(choices: Choice<Value>[], value: Value): string | null {
    return choices.find(choice => choice.value === value)?.label ?? null
}
