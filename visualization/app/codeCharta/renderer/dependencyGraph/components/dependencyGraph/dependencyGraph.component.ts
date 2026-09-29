import { ChangeDetectionStrategy, Component, ElementRef, effect, input, OnDestroy, output, viewChild } from "@angular/core"
import { buildDependencyGraphOption } from "../../util/dependencyGraphOption.builder"
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

    readonly boxClicked = output<string>()
    readonly boxToggled = output<string>()
    readonly boxHovered = output<string | null>()
    readonly boxRightClicked = output<RightClickedBox>()
    readonly rendered = output<void>()
    readonly boxDragged = output<DraggedBox>()

    private readonly chartContainer = viewChild.required<ElementRef<HTMLElement>>("chartContainer")

    private readonly chartHost = new DependencyGraphHost({
        onBoxClicked: path => this.boxClicked.emit(path),
        onBoxToggled: path => this.boxToggled.emit(path),
        onBoxHovered: path => this.boxHovered.emit(path),
        onBoxRightClicked: (path, clientX, clientY) => this.boxRightClicked.emit({ path, clientX, clientY }),
        onRendered: () => this.rendered.emit(),
        canDragBox: (path, point) => this.canDragBox()(path, point),
        onBoxDragged: (path, dx, dy) => this.boxDragged.emit({ path, dx, dy })
    })

    constructor() {
        effect(() => this.chartHost.attachTo(this.chartContainer().nativeElement))
        effect(() => this.renderOnceTheContainerIsMeasured())
    }

    resetView(): void {
        this.chartHost.resetView()
    }

    ngOnDestroy(): void {
        this.chartHost.dispose()
    }

    private renderOnceTheContainerIsMeasured(): void {
        const viewport = this.chartHost.containerSize()
        if (viewport.width === 0 || viewport.height === 0) {
            return
        }
        this.chartHost.render(buildDependencyGraphOption(this.scene(), viewport))
    }
}
