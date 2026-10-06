import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, input, OnDestroy, output, viewChild } from "@angular/core"
import { DependencyGraphChartRegistry } from "../../services/dependencyGraphChart.registry"
import { AxisWindow, fitWindowOf, Viewport, windowHolding, windowKeepingInPlace } from "../../util/axisWindow"
import { buildDependencyGraphOption } from "../../util/dependencyGraphOption.builder"
import { DependencyGraphScene } from "../../util/dependencyGraphScene"
import { Point } from "../../util/geometry"
import { DependencyGraphLayout, LayoutBox } from "../../util/layoutModel"
import { DependencyGraphBoxListComponent } from "../dependencyGraphBoxList/dependencyGraphBoxList.component"
import { DependencyGraphHost } from "./dependencyGraphHost"

export interface RightClickedBox {
    path: string
    clientX: number
    clientY: number
}

/** A request to bring boxes into view; a new id asks again for the same boxes. */
export interface ViewRequest {
    id: number
    paths: readonly string[]
}

export interface DraggedBox {
    path: string
    deltaX: number
    deltaY: number
}

/** A box as it lay when the reader opened or closed it, to show it at the same spot once it is laid out anew. */
interface ToggledBox {
    box: LayoutBox
    layout: DependencyGraphLayout
}

const NOTHING_DRAGGABLE = () => false
const NO_BOX_ANYWHERE = () => null

@Component({
    selector: "cc-dependency-graph",
    templateUrl: "./dependencyGraph.component.html",
    imports: [DependencyGraphBoxListComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "relative block h-full w-full" }
})
export class DependencyGraphComponent implements OnDestroy {
    readonly scene = input.required<DependencyGraphScene>()
    /** The whole graph is fitted into view when this changes, so a new map or focus is seen whole. */
    readonly graphIdentity = input.required<string>()
    /** Raising this counter fits the whole graph into view with the next drawing. */
    readonly fitRequest = input(0)
    readonly viewRequest = input<ViewRequest | null>(null)
    /** Whether pressing this box drags it rather than the graph. */
    readonly canDragBox = input<(path: string) => boolean>(NOTHING_DRAGGABLE)
    /** The box painted on top at a layout point, which takes the clicks on an edge lying over it. */
    readonly boxAt = input<(point: Point) => string | null>(NO_BOX_ANYWHERE)

    readonly boxClicked = output<string>()
    readonly boxToggled = output<string>()
    readonly cycleBadgeClicked = output<string>()
    readonly edgeClicked = output<string>()
    readonly boxHovered = output<string | null>()
    /** A box the keyboard reached, which may lie outside the part of the graph in view. */
    readonly boxFocused = output<string>()
    readonly boxRightClicked = output<RightClickedBox>()
    readonly rendered = output<void>()
    readonly boxDragged = output<DraggedBox>()
    readonly boxDragEnded = output<void>()

    private readonly chartContainer = viewChild.required<ElementRef<HTMLElement>>("chartContainer")
    private fittedGraphIdentity: string | null = null
    private handledFitRequest = 0
    private handledViewRequest: number | null = null
    private toggledBox: ToggledBox | null = null

    private readonly chartHost = new DependencyGraphHost(inject(DependencyGraphChartRegistry), {
        onBoxClicked: path => this.boxClicked.emit(path),
        onBoxToggled: path => this.toggle(path),
        onCycleBadgeClicked: path => this.cycleBadgeClicked.emit(path),
        onEdgeClicked: edgeId => this.edgeClicked.emit(edgeId),
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

    protected focusBox(path: string | null): void {
        this.boxHovered.emit(path)
        if (path !== null) {
            this.boxFocused.emit(path)
        }
    }

    protected toggle(path: string): void {
        const layout = this.scene().layout
        const box = layout.boxes.find(candidate => candidate.path === path)
        this.toggledBox = box ? { box, layout } : null
        this.boxToggled.emit(path)
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
        const toggledBox = this.consumeToggledBox(scene.layout)
        const shownWindow = this.consumeDueFit() ? null : this.shownWindowKeeping(toggledBox, viewport)
        const asked = this.consumeDueViewRequest()
        const windowHoldingTheAsked = asked && windowHolding(asked, scene.layout, viewport, shownWindow)
        return windowHoldingTheAsked ?? shownWindow ?? fitWindowOf(scene.layout, viewport)
    }

    private shownWindowKeeping(toggledBox: [LayoutBox, LayoutBox] | null, viewport: Viewport): AxisWindow | null {
        const shownWindow = this.chartHost.shownWindowFor(viewport)
        return shownWindow && toggledBox ? windowKeepingInPlace(shownWindow, ...toggledBox, viewport) : shownWindow
    }

    /** The toggled box before and after the layout that followed its toggling; null on any other drawing. */
    private consumeToggledBox(layout: DependencyGraphLayout): [LayoutBox, LayoutBox] | null {
        const toggled = this.toggledBox
        if (toggled === null || toggled.layout === layout) {
            return null
        }
        this.toggledBox = null
        const laidOutAnew = layout.boxes.find(box => box.path === toggled.box.path)
        return laidOutAnew && laidOutAnew.isExpanded !== toggled.box.isExpanded ? [toggled.box, laidOutAnew] : null
    }

    private consumeDueViewRequest(): readonly string[] | null {
        const request = this.viewRequest()
        if (request === null || request.id === this.handledViewRequest) {
            return null
        }
        this.handledViewRequest = request.id
        return request.paths
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
