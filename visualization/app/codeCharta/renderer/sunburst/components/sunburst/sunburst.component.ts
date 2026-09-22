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
import { SunburstChartRegistry } from "../../services/sunburstChart.registry"
import { SunburstColoring } from "../../util/sunburstColor"
import { buildSunburstOption, VISIBLE_RING_COUNT } from "../../util/sunburstOption.builder"
import { colorValueRange, findClosestFolder, findFolder, isInside, SunburstMetrics, SunburstNode } from "../../util/sunburstTree"
import { SunburstChartHost } from "./sunburstChartHost"

const NO_COLOR_VALUES = { minValue: 0, maxValue: 0 }

@Component({
    selector: "cc-sunburst",
    templateUrl: "./sunburst.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "block h-full w-full" }
})
export class SunburstComponent implements OnDestroy {
    readonly tree = input.required<SunburstNode>()
    readonly centrePath = input.required<string>()
    readonly hoveredPath = input<string | null>(null)
    readonly metrics = input.required<SunburstMetrics>()
    readonly coloring = input.required<SunburstColoring>()

    readonly folderClicked = output<string>()
    readonly centreClicked = output<void>()
    readonly folderHovered = output<string | null>()

    private readonly chartContainer = viewChild.required<ElementRef<HTMLElement>>("chartContainer")

    private readonly chartHost = new SunburstChartHost(inject(SunburstChartRegistry), {
        onFolderClicked: path => this.folderClicked.emit(path),
        onCentreClicked: () => this.centreClicked.emit(),
        onFolderHovered: path => this.folderHovered.emit(path)
    })

    private readonly centre = computed(() => findFolder(this.tree(), this.centrePath()) ?? this.tree())

    private readonly folderColorValueRange = computed(() => colorValueRange(this.tree()) ?? NO_COLOR_VALUES)

    private readonly highlightedFolderPath = computed(() => {
        const hoveredPath = this.hoveredPath()
        const centre = this.centre()
        if (hoveredPath === null || !isInside(hoveredPath, centre.path)) {
            return null
        }
        const displayedFolder = findClosestFolder(centre, hoveredPath, VISIBLE_RING_COUNT)
        return displayedFolder === centre ? null : displayedFolder.path
    })

    constructor() {
        effect(() => this.chartHost.attachTo(this.chartContainer().nativeElement))
        effect(() => this.renderOnceTheContainerIsMeasured())
        effect(() => this.chartHost.highlight(this.highlightedFolderPath()))
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
                folderColorValueRange: this.folderColorValueRange(),
                chartSizeInPixels: Math.min(width, height)
            })
        )
    }
}
