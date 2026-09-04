import { signal } from "@angular/core"

const DEFAULT_ROW_HEIGHT = 28
const WORD_ROW_SELECTOR = "cc-domain-word-row"
const BREAKDOWN_SELECTOR = "[data-word-breakdown]"

export interface MeasuredViewport {
    scrolledPast: number
    viewportHeight: number
    rowHeight: number
    expandedHeight: number
}

const UNMEASURED: MeasuredViewport = { scrolledPast: 0, viewportHeight: 0, rowHeight: DEFAULT_ROW_HEIGHT, expandedHeight: 0 }

/**
 * Reads how much of the word list is actually on screen. The list can be far taller than its panel, so
 * only the measured slice is rendered; everything here is DOM measurement, kept out of the component so
 * the component stays about words.
 */
export class WordListViewport {
    private host?: HTMLElement
    private scrollHost: HTMLElement | null = null
    private resizeObserver?: ResizeObserver
    private openBreakdownWord: string | null = null
    private openBreakdownHeight = 0

    private readonly measured = signal<MeasuredViewport>(UNMEASURED, {
        equal: (one, other) =>
            one.scrolledPast === other.scrolledPast &&
            one.viewportHeight === other.viewportHeight &&
            one.rowHeight === other.rowHeight &&
            one.expandedHeight === other.expandedHeight
    })

    readonly geometry = this.measured.asReadonly()

    private readonly remeasure = () => this.measure()

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
        // The list's own height changes when a breakdown opens; the panel's when the window is resized.
        if (typeof ResizeObserver !== "undefined") {
            this.resizeObserver = new ResizeObserver(this.remeasure)
            this.resizeObserver.observe(host)
            this.resizeObserver.observe(scrollHost)
        }
        this.measure()
    }

    /**
     * Which word's breakdown is open. Its height has to be remembered rather than re-read every time: the
     * breakdown is only rendered while its own row is inside the window, so measuring it as zero once that
     * row scrolls out would pull every row below it upwards mid-scroll.
     */
    trackOpenBreakdown(word: string | null): void {
        if (this.openBreakdownWord === word) {
            return
        }
        this.openBreakdownWord = word
        this.openBreakdownHeight = 0
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
        const renderedBreakdownHeight = host.querySelector<HTMLElement>(BREAKDOWN_SELECTOR)?.offsetHeight
        if (renderedBreakdownHeight !== undefined) {
            this.openBreakdownHeight = renderedBreakdownHeight
        }
        this.measured.set({
            scrolledPast: Math.max(0, scrollHost.getBoundingClientRect().top - host.getBoundingClientRect().top),
            viewportHeight: scrollHost.clientHeight,
            rowHeight: host.querySelector<HTMLElement>(WORD_ROW_SELECTOR)?.offsetHeight || DEFAULT_ROW_HEIGHT,
            expandedHeight: this.openBreakdownWord === null ? 0 : this.openBreakdownHeight
        })
    }

    /** Scrolls the panel to an offset within the list, so a row that is not rendered can still be reached. */
    scrollTo(offsetWithinTheList: number): void {
        const { host, scrollHost } = this
        if (!host || !scrollHost || !scrollHost.contains(host)) {
            return
        }
        const listTopWithinScrollHost = host.getBoundingClientRect().top - scrollHost.getBoundingClientRect().top + scrollHost.scrollTop
        scrollHost.scrollTop = Math.max(0, listTopWithinScrollHost + offsetWithinTheList)
        this.measure()
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
