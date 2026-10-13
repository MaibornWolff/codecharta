import { ChangeDetectionStrategy, Component, ElementRef, inject, OnDestroy } from "@angular/core"
import { InspectorWidthService } from "../../services/inspectorWidth.service"

/** The left edge of an inspector, which sits at the right of its view: dragging it sets the width of every inspector. */
@Component({
    selector: "cc-inspector-resize-handle",
    template: "",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: "absolute left-0 top-0 z-10 h-full w-1.5 cursor-col-resize select-none hover:bg-primary/40 active:bg-primary/60",
        title: "Drag to resize, double-click to reset",
        "data-testid": "inspector-resize-handle",
        "(pointerdown)": "startResize($event)",
        "(dblclick)": "resetWidth()"
    }
})
export class InspectorResizeHandleComponent implements OnDestroy {
    private readonly widthService = inject(InspectorWidthService)
    private readonly handle = inject<ElementRef<HTMLElement>>(ElementRef)

    private isResizing = false
    private readonly onPointerMove = (event: PointerEvent) => this.resize(event)
    private readonly onPointerUp = () => this.stopResize()

    startResize(event: PointerEvent): void {
        event.preventDefault()
        this.isResizing = true
        document.body.style.userSelect = "none"
        globalThis.addEventListener("pointermove", this.onPointerMove)
        globalThis.addEventListener("pointerup", this.onPointerUp)
        globalThis.addEventListener("pointercancel", this.onPointerUp)
    }

    resetWidth(): void {
        this.widthService.reset()
    }

    ngOnDestroy(): void {
        this.stopResize()
    }

    private resize(event: PointerEvent): void {
        const inspector = this.handle.nativeElement.parentElement
        if (!this.isResizing || !inspector) {
            return
        }
        this.widthService.setWidth(inspector.getBoundingClientRect().right - event.clientX)
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
    }
}
