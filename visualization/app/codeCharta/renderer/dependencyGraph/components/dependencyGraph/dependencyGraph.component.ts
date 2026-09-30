import { ChangeDetectionStrategy, Component, ElementRef, effect, input, OnDestroy, output, viewChild } from "@angular/core"
import { AxisWindow, buildDependencyGraphOption, fitWindowOf, Viewport } from "../../util/dependencyGraphOption.builder"
import { DependencyGraphScene } from "../../util/dependencyGraphScene"
import { Point } from "../../util/geometry"
import { DependencyGraphHost } from "./dependencyGraphHost"

export interface RightClickedBox {
    path: string
    clientX: number
    clientY: number
}

export interface DraggedBox {
    path: string
    deltaX: number
    deltaY: number
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
    /** The whole graph is fitted into view when this changes, so a new map or focus is seen whole. */
    readonly graphIdentity = input.required<string>()
    /** Raising this counter fits the whole graph into view with the next drawing. */
    readonly fitRequest = input(0)
    /** Whether pressing this box drags it rather than the graph. */
    readonly canDragBox = input<(path: string) => boolean>(NOTHING_DRAGGABLE)
    /** The box painted on top at a layout point, which takes the clicks on an edge lying over it. */
    readonly boxAt = input<(point: Point) => string | null>(NO_BOX_ANYWHERE)

    readonly boxClicked = output<string>()
    readonly boxToggled = output<string>()
    readonly boxHovered = output<string | null>()
    readonly boxRightClicked = output<RightClickedBox>()
    readonly rendered = output<void>()
    readonly boxDragged = output<DraggedBox>()
    readonly boxDragEnded = output<void>()

    private readonly chartContainer = viewChild.required<ElementRef<HTMLElement>>("chartContainer")
    private fittedGraphIdentity: string | null = null
    private handledFitRequest = 0

    private readonly chartHost = new DependencyGraphHost({
        onBoxClicked: path => this.boxClicked.emit(path),
        onBoxToggled: path => this.boxToggled.emit(path),
        onBoxHovered: path => this.boxHovered.emit(path),
        onBoxRightClicked: (path, clientX, clientY) => this.boxRightClicked.emit({ path, clientX, clientY }),
        onRendered: () => this.rendered.emit(),
        canDragBox: path => this.canDragBox()(path),
        onBoxDragged: (path, deltaX, deltaY) => this.boxDragged.emit({ path, deltaX, deltaY }),
        onBoxDragEnded: () => this.boxDragEnded.emit(),
        boxAt: point => this.boxAt()(point)
    })

    constructor() {
        effect(() => this.chartHost.attachTo(this.chartContainer().nativeElement))
        effect(() => this.renderOnceTheContainerIsMeasured())
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
        this.chartHost.render(buildDependencyGraphOption(scene, viewport, this.windowToShow(scene, viewport)))
    }

    private windowToShow(scene: DependencyGraphScene, viewport: Viewport): AxisWindow {
        const shownWindow = this.consumeDueFit() ? null : this.chartHost.shownWindowFor(viewport)
        return shownWindow ?? fitWindowOf(scene.layout, viewport)
    }

    private consumeDueFit(): boolean {
        const graphIdentity = this.graphIdentity()
        const fitRequest = this.fitRequest()
        const isFitDue = graphIdentity !== this.fittedGraphIdentity || (fitRequest > 0 && fitRequest !== this.handledFitRequest)
        this.fittedGraphIdentity = graphIdentity
        this.handledFitRequest = fitRequest
        return isFitDue
    }
}
