import type { ECharts } from "echarts/core"

type LayoutPoint = [number, number]

export interface BoxDragHandlers {
    canDragBox: (path: string, point: LayoutPoint) => boolean
    onBoxDragged: (path: string, dx: number, dy: number) => void
    onBoxDragEnded: () => void
}

interface PointerEvent {
    offsetX: number
    offsetY: number
    event?: MouseEvent | TouchEvent
    /** ECharts' pan skips a press marked so; this is how a press on a box drags the box, not the graph. */
    __ecRoamConsumed?: boolean
}

interface Drag {
    path: string
    last: LayoutPoint
    pressedAt: [number, number]
    hasMoved: boolean
}

/** A press closer than this to where it started is still a click. */
export const DRAG_THRESHOLD_PX = 3
const PRIMARY_BUTTON = 0

/** Drags a box by the pointer, in layout units, one report per frame however fast the pointer moves. */
export class BoxDragGesture {
    private drag: Drag | null = null
    private pending: LayoutPoint = [0, 0]
    private frame?: number
    private hasJustDragged = false

    constructor(
        private readonly chart: ECharts,
        private readonly handlers: BoxDragHandlers
    ) {}

    press(path: string, pointer: PointerEvent): void {
        if (!isPrimaryPress(pointer)) {
            return
        }
        const point = this.toLayout(pointer)
        if (!this.handlers.canDragBox(path, point)) {
            return
        }
        pointer.__ecRoamConsumed = true
        this.drag = { path, last: point, pressedAt: [pointer.offsetX, pointer.offsetY], hasMoved: false }
    }

    move(pointer: PointerEvent): void {
        const drag = this.drag
        if (!drag) {
            return
        }
        drag.hasMoved ||= Math.hypot(pointer.offsetX - drag.pressedAt[0], pointer.offsetY - drag.pressedAt[1]) > DRAG_THRESHOLD_PX
        const point = this.toLayout(pointer)
        this.pending = [this.pending[0] + point[0] - drag.last[0], this.pending[1] + point[1] - drag.last[1]]
        drag.last = point
        this.frame ??= requestAnimationFrame(() => this.flush(drag.path))
    }

    release(): void {
        const drag = this.drag
        this.drag = null
        if (drag) {
            this.flush(drag.path)
            this.hasJustDragged = drag.hasMoved
            this.handlers.onBoxDragEnded()
        }
    }

    /** The click that ends a drag is no click on the box. Asked once per click. */
    takesClick(): boolean {
        const hasJustDragged = this.hasJustDragged
        this.hasJustDragged = false
        return hasJustDragged
    }

    cancel(): void {
        if (this.frame !== undefined) {
            cancelAnimationFrame(this.frame)
        }
        this.frame = undefined
        this.drag = null
        this.pending = [0, 0]
    }

    private flush(path: string): void {
        if (this.frame !== undefined) {
            cancelAnimationFrame(this.frame)
            this.frame = undefined
        }
        const [dx, dy] = this.pending
        this.pending = [0, 0]
        if (dx !== 0 || dy !== 0) {
            this.handlers.onBoxDragged(path, dx, dy)
        }
    }

    private toLayout(pointer: PointerEvent): LayoutPoint {
        return layoutPointAt(this.chart, pointer)
    }
}

/** A touch carries no button and drags like the primary one. */
function isPrimaryPress({ event }: PointerEvent): boolean {
    return !event || !("button" in event) || event.button === PRIMARY_BUTTON
}

export function layoutPointAt(chart: ECharts, { offsetX, offsetY }: { offsetX: number; offsetY: number }): LayoutPoint {
    const [x, y] = chart.convertFromPixel({ gridIndex: 0 }, [offsetX, offsetY]) as number[]
    return [x, y]
}
