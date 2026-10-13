import { Directive, ElementRef, Input, inject, OnDestroy, output } from "@angular/core"

/** The edge of the panel the handle lies on, which is the edge a drag moves. */
export type ResizedEdge = "left" | "right"

const KEYBOARD_STEP_PX = 16

/** The handle's parent is the panel it resizes. The handle tells the width the panel is asked to take; whoever
 * owns the width holds it within its bounds. */
@Directive({
    selector: "[ccColumnResizeHandle]",
    host: {
        class: "absolute top-0 z-10 h-full w-1.5 cursor-col-resize touch-none select-none hover:bg-primary/40 focus-visible:bg-primary/40 active:bg-primary/60",
        "[class.left-0]": "edge === 'left'",
        "[class.right-0]": "edge === 'right'",
        role: "separator",
        "aria-orientation": "vertical",
        "aria-label": "Resize",
        tabindex: "0",
        title: "Drag or use the arrow keys to resize, double-click to reset",
        "(pointerdown)": "startResize($event)",
        "(dblclick)": "widthReset.emit()",
        "(keydown.arrowLeft)": "moveEdgeBy(-keyboardStepPx, $event)",
        "(keydown.arrowRight)": "moveEdgeBy(keyboardStepPx, $event)"
    }
})
export class ColumnResizeHandleDirective implements OnDestroy {
    @Input({ alias: "ccColumnResizeHandle" }) edge: ResizedEdge = "right"

    readonly widthChange = output<number>()
    /** The drag was let go, or a key moved the edge: the moment to remember the width. */
    readonly resizeEnd = output<void>()
    readonly widthReset = output<void>()

    protected readonly keyboardStepPx = KEYBOARD_STEP_PX

    private readonly handle = inject<ElementRef<HTMLElement>>(ElementRef)
    private isResizing = false
    private readonly onPointerMove = (event: PointerEvent) => this.resizeTo(event.clientX)
    private readonly onPointerUp = () => this.stopResize()

    ngOnDestroy(): void {
        this.stopResize()
    }

    protected startResize(event: PointerEvent): void {
        event.preventDefault()
        this.isResizing = true
        document.body.style.userSelect = "none"
        globalThis.addEventListener("pointermove", this.onPointerMove)
        globalThis.addEventListener("pointerup", this.onPointerUp)
        globalThis.addEventListener("pointercancel", this.onPointerUp)
    }

    protected moveEdgeBy(pixelsToTheRight: number, event: Event): void {
        const panel = this.panelRect()
        if (!panel) {
            return
        }
        event.preventDefault()
        this.widthChange.emit(panel.width + (this.edge === "right" ? pixelsToTheRight : -pixelsToTheRight))
        this.resizeEnd.emit()
    }

    private resizeTo(clientX: number): void {
        const panel = this.panelRect()
        if (!this.isResizing || !panel) {
            return
        }
        this.widthChange.emit(this.edge === "right" ? clientX - panel.left : panel.right - clientX)
    }

    private stopResize(): void {
        if (!this.isResizing) {
            return
        }
        this.isResizing = false
        document.body.style.userSelect = ""
        globalThis.removeEventListener("pointermove", this.onPointerMove)
        globalThis.removeEventListener("pointerup", this.onPointerUp)
        globalThis.removeEventListener("pointercancel", this.onPointerUp)
        this.resizeEnd.emit()
    }

    private panelRect(): DOMRect | undefined {
        return this.handle.nativeElement.parentElement?.getBoundingClientRect()
    }
}
