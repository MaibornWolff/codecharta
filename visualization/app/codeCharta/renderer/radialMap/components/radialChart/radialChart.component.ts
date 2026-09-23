import {
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    effect,
    inject,
    input,
    OnDestroy,
    output,
    viewChild
} from "@angular/core"
import { RadialChartRegistry } from "../../services/radialChart.registry"
import { RadialColoring } from "../../util/radialColor"
import { findClosestNode, isInside, RadialMetrics, RadialNode } from "../../util/radialTree"
import { buildSunburstOption, VISIBLE_RING_COUNT } from "../../util/sunburstOption.builder"
import { RadialChartHost } from "./radialChartHost"

export interface RightClickedNode {
    path: string
    clientX: number
    clientY: number
}

@Component({
    selector: "cc-radial-chart",
    templateUrl: "./radialChart.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "block h-full w-full" }
})
export class RadialChartComponent implements OnDestroy {
    readonly tree = input.required<RadialNode>()
    readonly centre = input.required<RadialNode>()
    readonly hoveredPath = input<string | null>(null)
    readonly metrics = input.required<RadialMetrics>()
    readonly coloring = input.required<RadialColoring>()

    readonly folderClicked = output<string>()
    readonly fileClicked = output<string>()
    readonly centreClicked = output<void>()
    readonly nodeHovered = output<string | null>()
    readonly nodeRightClicked = output<RightClickedNode>()

    private readonly chartContainer = viewChild.required<ElementRef<HTMLElement>>("chartContainer")

    private readonly chartHost = new RadialChartHost(inject(RadialChartRegistry), {
        onFolderClicked: path => this.folderClicked.emit(path),
        onFileClicked: path => this.fileClicked.emit(path),
        onCentreClicked: () => this.centreClicked.emit(),
        onNodeHovered: path => this.nodeHovered.emit(path),
        onNodeRightClicked: (path, clientX, clientY) => this.nodeRightClicked.emit({ path, clientX, clientY })
    })

    private readonly highlightedPath = computed(() => {
        const hoveredPath = this.hoveredPath()
        const centre = this.centre()
        if (hoveredPath === null || !isInside(hoveredPath, centre.path)) {
            return null
        }
        const displayedNode = findClosestNode(centre, hoveredPath, VISIBLE_RING_COUNT)
        return displayedNode === centre ? null : displayedNode.path
    })

    constructor() {
        effect(() => this.chartHost.attachTo(this.chartContainer().nativeElement))
        effect(() => this.renderOnceTheContainerIsMeasured())
        effect(() => this.chartHost.highlight(this.highlightedPath()))
    }

    ngOnDestroy(): void {
        this.chartHost.dispose()
    }

    private renderOnceTheContainerIsMeasured(): void {
        const { width, height } = this.chartHost.containerSize()
        if (width === 0 || height === 0) {
            return
        }
        this.chartHost.render(
            buildSunburstOption({
                centre: this.centre(),
                isMapRoot: this.centre() === this.tree(),
                metrics: this.metrics(),
                coloring: this.coloring(),
                chartSizeInPixels: Math.min(width, height)
            })
        )
    }
}
