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

export class BoxClickGesture {
    private lastClick: { path: string; at: number } | null = null
    private pendingSelection?: ReturnType<typeof setTimeout>

    constructor(private readonly handlers: BoxClickHandlers) {}

    click(path: string): void {
        this.lastClick = { path, at: Date.now() }
        this.cancelPendingSelection()
        this.pendingSelection = setTimeout(() => {
            this.pendingSelection = undefined
            this.handlers.onBoxClicked(path)
        }, SINGLE_CLICK_WAIT_MS)
    }

    readonly doubleClick = (): void => {
        this.cancelPendingSelection()
        const click = this.lastClick
        this.lastClick = null
        if (click && Date.now() - click.at <= DOUBLE_CLICK_MS) {
            this.handlers.onBoxToggled(click.path)
        }
    }

    /** A click on something else, as an edge or a badge, ends what a click on a box began. */
    forget(): void {
        this.cancelPendingSelection()
        this.lastClick = null
    }

    private cancelPendingSelection(): void {
        clearTimeout(this.pendingSelection)
        this.pendingSelection = undefined
    }
}
