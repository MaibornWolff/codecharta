import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { EdgeStyle, EdgeThickness } from "../../../../renderer/dependencyGraph/dependencyGraph.facade"
import { BAR_BOTTOM_ABOVE_BOTTOM_BAR, BarShellDirective, SliderNumberInputComponent } from "../../../shared/facade"
import { DependencyMapReadStore } from "../../stores/dependencyMap.read.store"
import { DependencyMapWriteStore } from "../../stores/dependencyMap.write.store"
import { Choice, ChoiceSegmentComponent } from "../choiceSegment/choiceSegment.component"
import { EdgeMetricSegmentComponent } from "../edgeMetricSegment/edgeMetricSegment.component"
import { EdgeTypesSegmentComponent } from "../edgeTypesSegment/edgeTypesSegment.component"

const EDGE_STYLE_CHOICES: Choice[] = [
    { value: "curved", label: "Curved", hint: "Leave and enter each box square to its side" },
    { value: "spread", label: "Spread", hint: "Curved, each edge with its own spot on the box" },
    { value: "upwardAside", label: "Upward aside", hint: "Upward edges bow out to the right of the boxes" },
    { value: "straight", label: "Straight", hint: "A straight line from box to box" }
]

const EDGE_THICKNESS_CHOICES: Choice[] = [
    { value: "byCount", label: "By count", hint: "Width grows with the dependencies an edge stands for" },
    { value: "thin", label: "Thin", hint: "Every edge a hairline, easiest to see through" },
    { value: "uniform", label: "Uniform", hint: "Every edge the same width" },
    { value: "strong", label: "Strong", hint: "Grows with the dependencies, twice as pronounced" }
]

const EDGE_WIDTH_FACTOR_RANGE = { min: 0.25, max: 3, step: 0.25 }

@Component({
    selector: "cc-dependency-bar",
    templateUrl: "./dependencyBar.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [EdgeMetricSegmentComponent, EdgeTypesSegmentComponent, ChoiceSegmentComponent, SliderNumberInputComponent],
    hostDirectives: [BarShellDirective],
    host: { "[style.bottom]": "barBottom" }
})
export class DependencyBarComponent {
    private readonly writeStore = inject(DependencyMapWriteStore)
    private readonly settings = toSignal(inject(DependencyMapReadStore).settings$, { requireSync: true })

    readonly barBottom = BAR_BOTTOM_ABOVE_BOTTOM_BAR
    readonly edgeStyleChoices = EDGE_STYLE_CHOICES
    readonly edgeThicknessChoices = EDGE_THICKNESS_CHOICES
    readonly widthFactorRange = EDGE_WIDTH_FACTOR_RANGE
    readonly edgeStyle = computed(() => this.settings().edgeStyle)
    readonly isAnchoredAtSideMiddle = computed(() => this.settings().isAnchoredAtSideMiddle)
    readonly edgeWidth = computed(() => this.settings().edgeWidth)

    drawEdgesAs(style: string): void {
        this.writeStore.changeSettings({ edgeStyle: style as EdgeStyle })
    }

    anchorAtSideMiddle(event: Event): void {
        this.writeStore.changeSettings({ isAnchoredAtSideMiddle: (event.target as HTMLInputElement).checked })
    }

    drawEdgesThick(thickness: string): void {
        this.writeStore.changeSettings({ edgeWidth: { ...this.edgeWidth(), thickness: thickness as EdgeThickness } })
    }

    scaleEdgeWidth(factor: number): void {
        this.writeStore.changeSettings({ edgeWidth: { ...this.edgeWidth(), factor } })
    }
}
