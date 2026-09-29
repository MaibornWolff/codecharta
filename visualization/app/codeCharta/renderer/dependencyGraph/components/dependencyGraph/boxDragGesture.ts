import type { ECharts } from "echarts/core"
import { Point } from "../../util/geometry"

export interface BoxDragHandlers {
    canDragBox: (path: string) => boolean
    onBoxDragged: (path: string, dx: number, dy: number) => void
    onBoxDragEnded: () => void
}

interface PointerEvent {
    offsetX: number
    offsetY: number
    event?: MouseEvent | TouchEvent
    /** ECharts' inside zoom skips a pointer move marked so. Switching its moveOnMouseMove off instead takes a
     * setOption, a full redraw, on every press and release, and a redraw replaces the box under the pointer,
     * which costs ECharts the click on it. The host hears each move before the pan does, because it listens
     * before the zoom exists. The spec pins that the installed ECharts still reads the mark. */
    __ecRoamConsumed?: boolean
}

interface Drag {
    path: string
    last: Point
    pressedAt: Point
    hasMoved: boolean
}

/** Below zrender's own 4px click tolerance, so a click after a tiny drag still arrives and has to be taken. */
export const DRAG_THRESHOLD_PX = 3
const PRIMARY_BUTTON = 0

export class BoxDragGesture {
    private drag: Drag | null = null
    private pending: Point = [0, 0]
    private frame?: number
    private hasJustDragged = false

    constructor(
        private readonly chart: ECharts,
        private readonly handlers: BoxDragHandlers
    ) {}

    press(path: string, pointer: PointerEvent): void {
        // zrender sends no click after a drag over its tolerance, so the next press is where a finished drag ends.
        this.hasJustDragged = false
        if (!isPrimaryPress(pointer) || !this.handlers.canDragBox(path)) {
            return
        }
        const pressedAt: Point = [pointer.offsetX, pointer.offsetY]
        this.drag = { path, last: this.toLayout(pointer), pressedAt, hasMoved: false }
    }

    move(pointer: PointerEvent): void {
        const drag = this.drag
        if (!drag) {
            return
        }
        pointer.__ecRoamConsumed = true
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

    takeClickThatEndedDrag(): boolean {
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

    private toLayout(pointer: PointerEvent): Point {
        return layoutPointAt(this.chart, pointer)
    }
}

/** A touch carries no button and drags like the primary one. */
function isPrimaryPress({ event }: PointerEvent): boolean {
    return !event || !("button" in event) || event.button === PRIMARY_BUTTON
}

export function layoutPointAt(chart: ECharts, { offsetX, offsetY }: { offsetX: number; offsetY: number }): Point {
    const [x, y] = chart.convertFromPixel({ gridIndex: 0 }, [offsetX, offsetY]) as number[]
    return [x, y]
}
