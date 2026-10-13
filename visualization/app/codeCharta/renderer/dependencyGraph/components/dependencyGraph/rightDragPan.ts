import { AxisWindow, Viewport, windowDraggedBy } from "../../util/axisWindow"
import { Point } from "../../util/geometry"
import { DRAG_THRESHOLD_PX } from "./boxDragGesture"
import { PANNING_ATTRIBUTE } from "./panKey"

const SECONDARY_BUTTON = 2
const SECONDARY_BUTTON_HELD = 2

export interface PannableView {
    shownWindow: AxisWindow
    /** How far the axes reach, which is as far as the graph can be panned. */
    reach: AxisWindow
    size: Viewport
}

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
    hasMarkedContainer: boolean
    isMenuAskedFor: boolean
    openMenu?: () => void
}

/** A drag with the secondary mouse button pans the graph from anywhere. ECharts' own pan answers to the primary
 * button alone, so the shown window is moved here. A press that drags nothing still opens the context menu: some
 * systems ask for it on the press already and others on the release, so it is held back until the release. */
export class RightDragPan {
    private container?: HTMLElement
    private pan: Pan | null = null
    private frame?: number
    private hasJustPanned = false

    constructor(private readonly chart: PannedChart) {}

    listenOver(container: HTMLElement): void {
        this.container = container
        container.addEventListener("mousedown", this.press)
        window.addEventListener("mousemove", this.move)
        window.addEventListener("mouseup", this.release)
        window.addEventListener("contextmenu", this.noteMenuAskedFor, true)
    }

    stopListening(): void {
        this.release()
        this.container?.removeEventListener("mousedown", this.press)
        window.removeEventListener("mousemove", this.move)
        window.removeEventListener("mouseup", this.release)
        window.removeEventListener("contextmenu", this.noteMenuAskedFor, true)
        this.container = undefined
        this.hasJustPanned = false
    }

    /** Opens the menu at once, or on the release when the button that asked for it is still down and may yet drag. */
    menuRequested(openMenu: () => void): void {
        if (this.pan) {
            this.pan.openMenu = openMenu
            return
        }
        openMenu()
    }

    private readonly press = (event: MouseEvent): void => {
        this.hasJustPanned = false
        const view = event.button === SECONDARY_BUTTON ? this.chart.view() : null
        if (view === null) {
            return
        }
        const pressedAt: Point = [event.clientX, event.clientY]
        this.pan = { view, pressedAt, pointer: pressedAt, hasMoved: false, hasMarkedContainer: false, isMenuAskedFor: false }
    }

    private readonly move = (event: MouseEvent): void => {
        const pan = this.pan
        if (!pan) {
            return
        }
        // The button was let go where no release could be heard, as outside the window.
        if ((event.buttons & SECONDARY_BUTTON_HELD) === 0) {
            this.release()
            return
        }
        pan.pointer = [event.clientX, event.clientY]
        if (!pan.hasMoved && distanceBetween(pan.pressedAt, pan.pointer) <= DRAG_THRESHOLD_PX) {
            return
        }
        pan.hasMoved = true
        this.markContainerPanned(pan)
        this.frame ??= requestAnimationFrame(() => this.showPanned(pan))
    }

    private readonly release = (): void => {
        const pan = this.pan
        this.pan = null
        if (!pan) {
            return
        }
        this.showPanned(pan)
        if (pan.hasMarkedContainer) {
            this.container?.removeAttribute(PANNING_ATTRIBUTE)
        }
        if (pan.hasMoved) {
            this.hasJustPanned = !pan.isMenuAskedFor
            return
        }
        pan.openMenu?.()
    }

    private readonly noteMenuAskedFor = (event: Event): void => {
        if (this.pan) {
            this.pan.isMenuAskedFor = true
            return
        }
        if (this.hasJustPanned) {
            this.hasJustPanned = false
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
        const { shownWindow, reach, size } = pan.view
        const dragged: Point = [pan.pointer[0] - pan.pressedAt[0], pan.pointer[1] - pan.pressedAt[1]]
        this.chart.show(windowDraggedBy(shownWindow, dragged, size, reach))
    }

    // The space bar may hold the mark already, and it is then the space bar's to take away.
    private markContainerPanned(pan: Pan): void {
        if (pan.hasMarkedContainer || !this.container || this.container.hasAttribute(PANNING_ATTRIBUTE)) {
            return
        }
        pan.hasMarkedContainer = true
        this.container.setAttribute(PANNING_ATTRIBUTE, "")
    }
}

function distanceBetween(first: Point, second: Point): number {
    return Math.hypot(second[0] - first[0], second[1] - first[1])
}
