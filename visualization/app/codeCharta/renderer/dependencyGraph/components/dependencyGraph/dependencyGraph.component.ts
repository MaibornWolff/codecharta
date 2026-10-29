import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    effect,
    inject,
    input,
    OnDestroy,
    output,
    signal,
    untracked,
    viewChild
} from "@angular/core"
import { BoxShots, DependencyGraphChartRegistry } from "../../services/dependencyGraphChart.registry"
import { AxisWindow, fitWindowOf, Viewport, windowHolding, windowKeepingInPlace } from "../../util/axisWindow"
import { buildDependencyGraphOption } from "../../util/dependencyGraphOption.builder"
import { DependencyGraphScene, sceneWithEdgesWithin } from "../../util/dependencyGraphScene"
import { CORNER_RADIUS_PX, HOVERED_COLOR, HOVERED_LINE_WIDTH_PX } from "../../util/dependencyGraphStyle"
import { clippedTo, Point, Rectangle } from "../../util/geometry"
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
const NO_PATHS: ReadonlySet<string> = new Set()
const POINTED_AT_DASH = { dashPx: 6, gapPx: 4 }

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
    /** How many pixels at the bottom lie under something drawn over the graph; nothing is fitted or brought there. */
    readonly coveredBottom = input(0)
    /** Whether pressing this box drags it rather than the graph. */
    readonly canDragBox = input<(path: string) => boolean>(NOTHING_DRAGGABLE)
    /** The box painted on top at a layout point, which takes the clicks on an edge lying over it. */
    readonly boxAt = input<(point: Point) => string | null>(NO_BOX_ANYWHERE)

    /** Boxes pointed at from outside the graph: dashes travel around each for as long as it is. They are drawn over
     * the chart, since moving them in it would redraw the whole graph for every step. */
    readonly pointedAtPaths = input(NO_PATHS)

    readonly boxClicked = output<string>()
    readonly boxToggled = output<string>()
    readonly cycleBadgeClicked = output<string>()
    readonly upwardBadgeClicked = output<string>()
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
    private coveredBottomAtTheFit = 0
    private handledViewRequest: number | null = null
    private toggledBox: ToggledBox | null = null

    protected readonly pointedAtRects = signal<Rectangle[]>([])
    protected readonly pointedAtOutline = {
        color: HOVERED_COLOR,
        lineWidthPx: HOVERED_LINE_WIDTH_PX,
        cornerRadiusPx: CORNER_RADIUS_PX,
        dashes: `${POINTED_AT_DASH.dashPx} ${POINTED_AT_DASH.gapPx}`,
        /** What the dashes travel by in one loop, which the keyframes read so that the loop has no seam. */
        dashPeriodPx: POINTED_AT_DASH.dashPx + POINTED_AT_DASH.gapPx
    }

    private readonly chartRegistry = inject(DependencyGraphChartRegistry)
    private readonly boxShots: BoxShots = {
        pixelRectOf: path => this.pixelRectInViewOf(path),
        renderWithEdgesWithin: (path, pixelRatio) => this.renderWithEdgesWithin(path, pixelRatio)
    }

    private readonly chartHost = new DependencyGraphHost(this.chartRegistry, {
        onBoxClicked: path => this.boxClicked.emit(path),
        onBoxToggled: path => this.toggle(path),
        onCycleBadgeClicked: path => this.cycleBadgeClicked.emit(path),
        onUpwardBadgeClicked: path => this.upwardBadgeClicked.emit(path),
        onEdgeClicked: edgeId => this.edgeClicked.emit(edgeId),
        onBoxHovered: path => this.boxHovered.emit(path),
        onBoxRightClicked: (path, clientX, clientY) => this.boxRightClicked.emit({ path, clientX, clientY }),
        onRendered: () => this.reportDrawn(),
        canDragBox: path => this.canDragBox()(path),
        onBoxDragged: (path, deltaX, deltaY) => this.boxDragged.emit({ path, deltaX, deltaY }),
        onBoxDragEnded: () => this.boxDragEnded.emit(),
        boxAt: point => this.boxAt()(point)
    })

    constructor() {
        effect(() => this.chartHost.attachTo(this.chartContainer().nativeElement))
        effect(() => this.renderOnceTheContainerIsMeasured())
        effect(() => this.placePointedAtRects())
        this.chartRegistry.provideBoxShots(this.boxShots)
    }

    ngOnDestroy(): void {
        this.chartRegistry.withdrawBoxShots(this.boxShots)
        this.chartHost.dispose()
    }

    private reportDrawn(): void {
        this.placePointedAtRects()
        this.rendered.emit()
    }

    /** The chart tells where a box lies only for what it last drew, so the rects are placed anew after every drawing. */
    private placePointedAtRects(): void {
        const pointedAt = this.pointedAtPaths()
        const boxes = pointedAt.size === 0 ? [] : untracked(this.scene).layout.boxes.filter(box => pointedAt.has(box.path))
        this.pointedAtRects.set(boxes.flatMap(box => this.chartHost.pixelRectOf(box) ?? []))
    }

    private pixelRectInViewOf(path: string): Rectangle | null {
        const box = untracked(this.scene).layout.boxes.find(candidate => candidate.path === path)
        if (!box) {
            return null
        }
        const pixelRect = this.chartHost.pixelRectOf(box)
        const { width, height } = this.chartHost.containerSize()
        return pixelRect && clippedTo(pixelRect, { x: 0, y: 0, width, height })
    }

    private renderWithEdgesWithin(path: string, pixelRatio: number): HTMLCanvasElement | null {
        const viewport = { ...this.chartHost.containerSize(), coveredBottom: untracked(this.coveredBottom) }
        const shownWindow = this.chartHost.shownWindowFor(viewport)
        if (!shownWindow) {
            return null
        }
        const option = buildDependencyGraphOption(sceneWithEdgesWithin(untracked(this.scene), path), viewport, shownWindow)
        return this.chartHost.renderOffScreen(option, viewport, pixelRatio)
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
        const viewport = { ...this.chartHost.containerSize(), coveredBottom: this.coveredBottom() }
        if (viewport.width === 0 || viewport.height === 0) {
            return
        }
        const scene = this.scene()
        this.chartHost.render(buildDependencyGraphOption(scene, viewport, this.windowToShow(scene, viewport)))
    }

    private windowToShow(scene: DependencyGraphScene, viewport: Viewport): AxisWindow {
        const toggledBox = this.consumeToggledBox(scene.layout)
        const shownWindow = this.consumeDueFit(viewport) ? null : this.shownWindowKeeping(toggledBox, viewport)
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

    /** What covers the bottom is measured only once it is drawn, which may be after the graph was first fitted:
     * that fit is then done again, or the graph would start out reaching under it. */
    private consumeDueFit({ coveredBottom }: Viewport): boolean {
        const graphIdentity = this.graphIdentity()
        const fitRequest = this.fitRequest()
        const isRequested = graphIdentity !== this.fittedGraphIdentity || (fitRequest > 0 && fitRequest !== this.handledFitRequest)
        const isCoverMeasuredSinceTheFit = this.coveredBottomAtTheFit === 0 && coveredBottom > 0
        this.fittedGraphIdentity = graphIdentity
        this.handledFitRequest = fitRequest
        if (isRequested || isCoverMeasuredSinceTheFit) {
            this.coveredBottomAtTheFit = coveredBottom
        }
        return isRequested || isCoverMeasuredSinceTheFit
    }
}
