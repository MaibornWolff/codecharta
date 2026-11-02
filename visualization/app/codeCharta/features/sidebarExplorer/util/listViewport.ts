import { signal } from "@angular/core"

const DEFAULT_ROW_HEIGHT = 28

export interface MeasuredViewport {
    scrolledPast: number
    viewportHeight: number
    rowHeight: number
}

const UNMEASURED: MeasuredViewport = { scrolledPast: 0, viewportHeight: 0, rowHeight: DEFAULT_ROW_HEIGHT }

/**
 * Reads how much of a list is actually on screen. The list can be far taller than its panel, so only the
 * measured slice is rendered; everything here is DOM measurement, kept out of the component showing the list.
 */
export class ListViewport {
    private host?: HTMLElement
    private scrollHost: HTMLElement | null = null
    private resizeObserver?: ResizeObserver

    private readonly measured = signal<MeasuredViewport>(UNMEASURED, {
        equal: (one, other) =>
            one.scrolledPast === other.scrolledPast && one.viewportHeight === other.viewportHeight && one.rowHeight === other.rowHeight
    })

    readonly geometry = this.measured.asReadonly()

    private readonly remeasure = () => this.measure()

    constructor(private readonly rowSelector: string) {}

    /**
     * The panel is handed in rather than searched for: the explorer destroys and re-creates it as the mode
     * switches or the sidebar collapses, and this list outlives all of that. Searching for it once left the
     * list unmeasured — and therefore rendering every row — for the rest of the session.
     */
    attachTo(host: HTMLElement, scrollHost: HTMLElement | null): void {
        if (this.host === host && this.scrollHost === scrollHost) {
            return
        }
        this.stopObserving()
        this.host = host
        this.scrollHost = scrollHost
        if (!scrollHost) {
            this.measured.set(UNMEASURED)
            return
        }
        scrollHost.addEventListener("scroll", this.remeasure, { passive: true })
        // The list's own height changes as rows come and go; the panel's when the window is resized.
        if (typeof ResizeObserver !== "undefined") {
            this.resizeObserver = new ResizeObserver(this.remeasure)
            this.resizeObserver.observe(host)
            this.resizeObserver.observe(scrollHost)
        }
        this.measure()
    }

    measure(): void {
        const { host, scrollHost } = this
        if (!host || !scrollHost) {
            return
        }
        // While the explorer browses files, this list is still built but sits outside the panel. Measuring
        // it there would read the file tree's geometry — and scrolling it would scroll the file tree.
        if (!scrollHost.contains(host)) {
            this.measured.set(UNMEASURED)
            return
        }
        this.measured.set({
            scrolledPast: Math.max(0, scrollHost.getBoundingClientRect().top - host.getBoundingClientRect().top),
            viewportHeight: scrollHost.clientHeight,
            rowHeight: host.querySelector<HTMLElement>(this.rowSelector)?.offsetHeight || DEFAULT_ROW_HEIGHT
        })
    }

    dispose(): void {
        this.stopObserving()
        this.host = undefined
        this.scrollHost = null
    }

    private stopObserving(): void {
        this.scrollHost?.removeEventListener("scroll", this.remeasure)
        this.resizeObserver?.disconnect()
        this.resizeObserver = undefined
    }
}
