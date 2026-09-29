import { ChangeDetectionStrategy, Component, ElementRef, effect, input, OnDestroy, output, viewChild } from "@angular/core"
import { buildDependencyGraphOption, fitWindowOf } from "../../util/dependencyGraphOption.builder"
import { DependencyGraphScene } from "../../util/dependencyGraphScene"
import { DependencyGraphHost } from "./dependencyGraphHost"

export interface RightClickedBox {
    path: string
    clientX: number
    clientY: number
}

export interface DraggedBox {
    path: string
    dx: number
    dy: number
}

const NOTHING_DRAGGABLE = () => false
const NO_BOX_ANYWHERE = () => null

@Component({
    selector: "cc-dependency-graph",
    templateUrl: "./dependencyGraph.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "block h-full w-full" }
})
export class DependencyGraphComponent implements OnDestroy {
    readonly scene = input.required<DependencyGraphScene>()
    /** Whether a press at this layout point on this box drags it rather than the graph. */
    readonly canDragBox = input<(path: string, point: [number, number]) => boolean>(NOTHING_DRAGGABLE)
    /** The box painted on top at a layout point, which takes the clicks on an edge lying over it. */
    readonly boxAt = input<(point: [number, number]) => string | null>(NO_BOX_ANYWHERE)

    readonly boxClicked = output<string>()
    readonly boxToggled = output<string>()
    readonly boxHovered = output<string | null>()
    readonly boxRightClicked = output<RightClickedBox>()
    readonly rendered = output<void>()
    readonly boxDragged = output<DraggedBox>()
    readonly boxDragEnded = output<void>()

    private readonly chartContainer = viewChild.required<ElementRef<HTMLElement>>("chartContainer")
    /** The graph the view was last fitted to, named by its root, so a new graph gets fitted once. */
    private fittedGraph: string | null = null

    private readonly chartHost = new DependencyGraphHost({
        onBoxClicked: path => this.boxClicked.emit(path),
        onBoxToggled: path => this.boxToggled.emit(path),
        onBoxHovered: path => this.boxHovered.emit(path),
        onBoxRightClicked: (path, clientX, clientY) => this.boxRightClicked.emit({ path, clientX, clientY }),
        onRendered: () => this.rendered.emit(),
        canDragBox: (path, point) => this.canDragBox()(path, point),
        onBoxDragged: (path, dx, dy) => this.boxDragged.emit({ path, dx, dy }),
        onBoxDragEnded: () => this.boxDragEnded.emit(),
        boxAt: point => this.boxAt()(point)
    })

    constructor() {
        effect(() => this.chartHost.attachTo(this.chartContainer().nativeElement))
        effect(() => this.renderOnceTheContainerIsMeasured())
    }

    resetView(): void {
        this.fitWholeGraph()
    }

    ngOnDestroy(): void {
        this.chartHost.dispose()
    }

    private renderOnceTheContainerIsMeasured(): void {
        const viewport = this.chartHost.containerSize()
        if (viewport.width === 0 || viewport.height === 0) {
            return
        }
        const scene = this.scene()
        this.chartHost.render(buildDependencyGraphOption(scene, viewport))
        const graph = scene.layout.boxes[0]?.path ?? null
        if (graph !== this.fittedGraph) {
            this.fittedGraph = graph
            this.fitWholeGraph()
        }
    }

    private fitWholeGraph(): void {
        this.chartHost.fitTo(fitWindowOf(this.scene().layout, this.chartHost.containerSize()))
    }
}
