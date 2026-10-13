import { AxisWindow, PannableView, windowDraggedBy } from "../../util/axisWindow"
import { Point } from "../../util/geometry"
import { DRAG_THRESHOLD_PX } from "./boxDragGesture"
import { PANNING_ATTRIBUTE } from "./panKey"

/** `MouseEvent.button` of a press or release. */
const SECONDARY_BUTTON = 2
/** The bit of `MouseEvent.buttons` that says the secondary button is down. */
const SECONDARY_BUTTON_MASK = 2

export interface PannedChart {
    /** Null before anything is drawn. */
    view: () => PannableView | null
    show: (shownWindow: AxisWindow) => void
}

interface Pan {
    view: PannableView
    pressedAt: Point
    pointer: Point
    hasMoved: boolean
    hasSetPanningAttribute: boolean
    hasSystemAskedForMenu: boolean
    openMenu?: () => void
}

/** ECharts' own pan answers to the primary button alone, so the shown window is moved here. Some systems ask for
 * the context menu on the press and others on the release, so it is held back until the release. */
export class RightDragPan {
    private container?: HTMLElement
    private pan: Pan | null = null
    private frame?: number
    private swallowsNextContextMenu = false

    constructor(private readonly chart: PannedChart) {}

    listenOver(container: HTMLElement): void {
        this.container = container
        container.addEventListener("mousedown", this.press)
        window.addEventListener("mousedown", this.forgetThePan, true)
        window.addEventListener("mousemove", this.move)
        window.addEventListener("mouseup", this.release)
        window.addEventListener("contextmenu", this.noteMenuAskedFor, true)
    }

    stopListening(): void {
        this.release()
        this.container?.removeEventListener("mousedown", this.press)
        window.removeEventListener("mousedown", this.forgetThePan, true)
        window.removeEventListener("mousemove", this.move)
        window.removeEventListener("mouseup", this.release)
        window.removeEventListener("contextmenu", this.noteMenuAskedFor, true)
        this.container = undefined
        this.swallowsNextContextMenu = false
    }

    openMenuUnlessDragStarts(openMenu: () => void): void {
        if (this.pan) {
            this.pan.openMenu = openMenu
            return
        }
        openMenu()
    }

    // A drag released where no menu request reaches the page, as outside the window, would otherwise swallow
    // the menu of the next right click anywhere.
    private readonly forgetThePan = (): void => {
        this.swallowsNextContextMenu = false
    }

    private readonly press = (event: MouseEvent): void => {
        const view = event.button === SECONDARY_BUTTON ? this.chart.view() : null
        if (view === null) {
            return
        }
        const pressedAt: Point = [event.clientX, event.clientY]
        this.pan = { view, pressedAt, pointer: pressedAt, hasMoved: false, hasSetPanningAttribute: false, hasSystemAskedForMenu: false }
    }

    private readonly move = (event: MouseEvent): void => {
        const pan = this.pan
        if (!pan) {
            return
        }
        // The button was let go where no release could be heard, as outside the window.
        if ((event.buttons & SECONDARY_BUTTON_MASK) === 0) {
            this.release()
            return
        }
        pan.pointer = [event.clientX, event.clientY]
        if (!pan.hasMoved && distanceBetween(pan.pressedAt, pan.pointer) <= DRAG_THRESHOLD_PX) {
            return
        }
        pan.hasMoved = true
        this.setPanningAttribute(pan)
        this.frame ??= requestAnimationFrame(() => this.showPanned(pan))
    }

    private readonly release = (): void => {
        const pan = this.pan
        this.pan = null
        if (!pan) {
            return
        }
        this.showPanned(pan)
        if (pan.hasSetPanningAttribute) {
            this.container?.removeAttribute(PANNING_ATTRIBUTE)
        }
        if (pan.hasMoved) {
            // A system that asks for the menu on the release has not asked yet; that one request belongs to the drag.
            this.swallowsNextContextMenu = !pan.hasSystemAskedForMenu
            return
        }
        pan.openMenu?.()
    }

    private readonly noteMenuAskedFor = (event: Event): void => {
        if (this.pan) {
            this.pan.hasSystemAskedForMenu = true
            return
        }
        if (this.swallowsNextContextMenu) {
            this.swallowsNextContextMenu = false
            event.preventDefault()
            event.stopPropagation()
        }
    }

    private showPanned(pan: Pan): void {
        if (this.frame !== undefined) {
            cancelAnimationFrame(this.frame)
            this.frame = undefined
        }
        if (!pan.hasMoved) {
            return
        }
        const dragged: Point = [pan.pointer[0] - pan.pressedAt[0], pan.pointer[1] - pan.pressedAt[1]]
        this.chart.show(windowDraggedBy(pan.view, dragged))
    }

    // The space bar may have set it already, and it is then the space bar's to remove.
    private setPanningAttribute(pan: Pan): void {
        if (pan.hasSetPanningAttribute || !this.container || this.container.hasAttribute(PANNING_ATTRIBUTE)) {
            return
        }
        pan.hasSetPanningAttribute = true
        this.container.setAttribute(PANNING_ATTRIBUTE, "")
    }
}

function distanceBetween(first: Point, second: Point): number {
    return Math.hypot(second[0] - first[0], second[1] - first[1])
}
