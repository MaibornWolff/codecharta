import { signal } from "@angular/core"

const DEFAULT_ROW_HEIGHT = 28
const MAX_FRAMES_TO_WAIT_FOR_A_LAID_OUT_PANEL = 30
const WORD_ROW_SELECTOR = "cc-domain-word-row"
const BREAKDOWN_SELECTOR = "[data-word-breakdown]"

export interface MeasuredViewport {
    scrolledPast: number
    viewportHeight: number
    rowHeight: number
    expandedHeight: number
}

/**
 * Reads how much of the word list is actually on screen. The list can be far taller than its panel, so
 * only the measured slice is rendered; everything here is DOM measurement, kept out of the component so
 * the component stays about words.
 */
export class WordListViewport {
    private host?: HTMLElement
    private scrollHost?: HTMLElement
    private resizeObserver?: ResizeObserver
    private readonly measured = signal<MeasuredViewport>(
        { scrolledPast: 0, viewportHeight: 0, rowHeight: DEFAULT_ROW_HEIGHT, expandedHeight: 0 },
        {
            equal: (a, b) =>
                a.scrolledPast === b.scrolledPast &&
                a.viewportHeight === b.viewportHeight &&
                a.rowHeight === b.rowHeight &&
                a.expandedHeight === b.expandedHeight
        }
    )

    readonly geometry = this.measured.asReadonly()

    private readonly remeasure = () => this.measure()

    attachTo(host: HTMLElement): void {
        if (this.host === host) {
            return
        }
        this.dispose()
        this.host = host
        this.observeThePanelOnceItIsLaidOut(MAX_FRAMES_TO_WAIT_FOR_A_LAID_OUT_PANEL)
    }

    /** The panel is measurable a frame or more after the list is put into it, so keep looking until it is:
     * an unmeasured list falls back to rendering every row, which is what the window exists to avoid. */
    private observeThePanelOnceItIsLaidOut(framesLeft: number): void {
        const host = this.host
        if (!host) {
            return
        }
        const scrollHost = findScrollHost(host)
        if (!scrollHost || scrollHost.clientHeight === 0) {
            if (framesLeft > 0) {
                requestAnimationFrame(() => this.observeThePanelOnceItIsLaidOut(framesLeft - 1))
            }
            return
        }
        this.scrollHost = scrollHost
        scrollHost.addEventListener("scroll", this.remeasure, { passive: true })
        // The list's own height changes when a breakdown opens; the panel's when the window is resized.
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
        this.measured.set({
            scrolledPast: Math.max(0, scrollHost.getBoundingClientRect().top - host.getBoundingClientRect().top),
            viewportHeight: scrollHost.clientHeight,
            rowHeight: host.querySelector<HTMLElement>(WORD_ROW_SELECTOR)?.offsetHeight || DEFAULT_ROW_HEIGHT,
            expandedHeight: host.querySelector<HTMLElement>(BREAKDOWN_SELECTOR)?.offsetHeight ?? 0
        })
    }

    /** Puts the given offset within the list at the top of the panel, so an unrendered row can be reached. */
    scrollTo(offsetWithinTheList: number): void {
        const { host, scrollHost } = this
        if (!host || !scrollHost) {
            return
        }
        const listTopWithinScrollHost = host.getBoundingClientRect().top - scrollHost.getBoundingClientRect().top + scrollHost.scrollTop
        scrollHost.scrollTop = listTopWithinScrollHost + offsetWithinTheList
        this.measure()
    }

    dispose(): void {
        this.scrollHost?.removeEventListener("scroll", this.remeasure)
        this.resizeObserver?.disconnect()
        this.resizeObserver = undefined
        this.host = undefined
        this.scrollHost = undefined
    }
}

function findScrollHost(element: HTMLElement): HTMLElement | undefined {
    let candidate = element.parentElement
    while (candidate) {
        const { overflowY } = getComputedStyle(candidate)
        if (overflowY === "auto" || overflowY === "scroll") {
            return candidate
        }
        candidate = candidate.parentElement
    }
    return undefined
}
