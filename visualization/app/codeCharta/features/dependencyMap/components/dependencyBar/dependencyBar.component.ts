import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { EdgeFilter, EdgeStyle } from "../../../../renderer/dependencyGraph/dependencyGraph.facade"
import { BAR_BOTTOM_ABOVE_BOTTOM_BAR, BarShellDirective } from "../../../shared/facade"
import { DependencyMapViewStore } from "../../stores/dependencyMapView.store"
import { Choice, ChoiceSegmentComponent } from "../choiceSegment/choiceSegment.component"

const EDGE_FILTER_CHOICES: Choice[] = [
    { value: "all", label: "All", hint: "Every dependency" },
    { value: "cycles", label: "Cycles", hint: "Only dependencies that take part in a cycle" },
    { value: "feedback", label: "Upward", hint: "Only dependencies that point upward, against the levels" },
    { value: "none", label: "None", hint: "Only the dependencies of the box under the pointer" }
]

const EDGE_STYLE_CHOICES: Choice[] = [
    { value: "curved", label: "Curved", hint: "Leave and enter each box square to its side" },
    { value: "spread", label: "Spread", hint: "Curved, each edge with its own spot on the box" },
    { value: "upwardAside", label: "Upward aside", hint: "Upward edges bow out to the right of the boxes" },
    { value: "straight", label: "Straight", hint: "A straight line from box to box" }
]

@Component({
    selector: "cc-dependency-bar",
    templateUrl: "./dependencyBar.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ChoiceSegmentComponent],
    hostDirectives: [BarShellDirective],
    host: { "[style.bottom]": "barBottom" }
})
export class DependencyBarComponent {
    private readonly viewStore = inject(DependencyMapViewStore)

    readonly barBottom = BAR_BOTTOM_ABOVE_BOTTOM_BAR
    readonly edgeFilterChoices = EDGE_FILTER_CHOICES
    readonly edgeStyleChoices = EDGE_STYLE_CHOICES
    readonly edgeFilter = this.viewStore.edgeFilter
    readonly edgeStyle = this.viewStore.edgeStyle

    showEdges(filter: string): void {
        this.viewStore.showEdges(filter as EdgeFilter)
    }

    drawEdgesAs(style: string): void {
        this.viewStore.drawEdgesAs(style as EdgeStyle)
    }
}
