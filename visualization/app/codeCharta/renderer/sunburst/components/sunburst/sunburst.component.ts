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
import { findClosestFolder, findFolder, isInside, SunburstFolder, SunburstMetrics } from "../../util/sunburstFolders"
import { buildSunburstOption, VISIBLE_RING_COUNT } from "../../util/sunburstOption.builder"
import { SunburstChartHost } from "./sunburstChartHost"

@Component({
    selector: "cc-sunburst",
    templateUrl: "./sunburst.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "block h-full w-full" }
})
export class SunburstComponent implements OnDestroy {
    readonly folders = input.required<SunburstFolder>()
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

    private readonly centre = computed(() => findFolder(this.folders(), this.centrePath()) ?? this.folders())

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
                isMapRoot: this.centre() === this.folders(),
                metrics: this.metrics(),
                coloring: this.coloring(),
                chartSizeInPixels: Math.min(width, height)
            })
        )
    }
}
