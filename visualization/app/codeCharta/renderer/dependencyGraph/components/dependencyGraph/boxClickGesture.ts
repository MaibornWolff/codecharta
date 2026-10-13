/** A redraw replaces the element under the pointer, and ECharts then loses the second click of a double click.
 * The browser's own double click still arrives on the container, and it toggles the box the first click landed on. */
export const DOUBLE_CLICK_MS = 500
/** A click waits this long before it selects, so a double click toggles without selecting first. Shorter than
 * DOUBLE_CLICK_MS: a slow double click selects and then toggles. */
export const SINGLE_CLICK_WAIT_MS = 250

export interface BoxClickHandlers {
    onBoxClicked: (path: string) => void
    onBoxToggled: (path: string) => void
}

interface BoxClick {
    path: string
    at: number
}

export class BoxClickGesture {
    private firstClick: BoxClick | null = null
    private pendingSelection?: ReturnType<typeof setTimeout>

    constructor(private readonly handlers: BoxClickHandlers) {}

    click(path: string): void {
        this.firstClick = this.firstClickAfter({ path, at: Date.now() })
        this.cancelPendingSelection()
        this.pendingSelection = setTimeout(() => {
            this.pendingSelection = undefined
            this.handlers.onBoxClicked(path)
        }, SINGLE_CLICK_WAIT_MS)
    }

    readonly doubleClick = (): void => {
        const firstClick = this.firstClick
        this.firstClick = null
        if (firstClick && isWithinADoubleClick(firstClick, Date.now())) {
            this.cancelPendingSelection()
            this.handlers.onBoxToggled(firstClick.path)
        }
    }

    /** A click on something else, as an edge or a badge, ends what a click on a box began. */
    forget(): void {
        this.cancelPendingSelection()
        this.firstClick = null
    }

    /** A second click on the same box keeps the first as the start of the double click. One on another box, which
     * a redraw may have put under the resting pointer, makes no double click of either. */
    private firstClickAfter(click: BoxClick): BoxClick | null {
        const firstClick = this.firstClick
        if (!firstClick || !isWithinADoubleClick(firstClick, click.at)) {
            return click
        }
        return firstClick.path === click.path ? firstClick : null
    }

    private cancelPendingSelection(): void {
        clearTimeout(this.pendingSelection)
        this.pendingSelection = undefined
    }
}

function isWithinADoubleClick(firstClick: BoxClick, now: number): boolean {
    return now - firstClick.at <= DOUBLE_CLICK_MS
}
