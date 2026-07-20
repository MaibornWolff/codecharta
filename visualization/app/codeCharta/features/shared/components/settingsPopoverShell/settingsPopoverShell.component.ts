import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, input, OnDestroy, viewChild } from "@angular/core"

const VIEWPORT_PADDING = 8

@Component({
    selector: "cc-settings-popover-shell",
    templateUrl: "./settingsPopoverShell.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" }
})
export class SettingsPopoverShellComponent implements AfterViewInit, OnDestroy {
    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()
    readonly widthClass = input<string>("w-72")
    readonly contentClass = input<string>("gap-2.5 py-2 px-5")
    readonly testId = input<string | null>(null)

    /**
     * The shell is a `role="dialog"`, so it needs an accessible name. Consumers that project a heading pass
     * its id via `ariaLabelledBy`; the rest fall back to a generic name rather than opening unannounced.
     */
    readonly ariaLabelledBy = input<string | null>(null)
    readonly ariaLabel = input<string>("Settings")

    readonly popover = viewChild.required<ElementRef<HTMLElement>>("popover")

    // Fallback for browsers without CSS Anchor Positioning (e.g. Firefox): position the
    // popover next to its anchor with JS, otherwise it opens centered in the viewport.
    private readonly toggleListener = (event: Event) => {
        if ((event as ToggleEvent).newState !== "open" || supportsCssAnchorPositioning()) {
            return
        }
        this.positionRelativeToAnchor()
    }

    ngAfterViewInit(): void {
        this.popover().nativeElement.addEventListener("toggle", this.toggleListener)
    }

    ngOnDestroy(): void {
        this.popover().nativeElement.removeEventListener("toggle", this.toggleListener)
    }

    private positionRelativeToAnchor() {
        const anchor = document.querySelector(`[data-anchor-name="${this.anchorName()}"]`)
        if (!(anchor instanceof HTMLElement)) {
            return
        }
        const popover = this.popover().nativeElement
        const anchorRect = anchor.getBoundingClientRect()
        const popoverWidth = popover.getBoundingClientRect().width
        const left = Math.max(VIEWPORT_PADDING, Math.min(anchorRect.left, window.innerWidth - popoverWidth - VIEWPORT_PADDING))
        popover.style.position = "fixed"
        popover.style.margin = "0"
        popover.style.left = `${left}px`
        popover.style.top = "auto"
        popover.style.bottom = `${window.innerHeight - anchorRect.top}px`
        // Pinning only the bottom lets a tall popover grow off the top of the viewport, where it cannot be
        // scrolled back into reach; cap it at the space actually above the anchor and let the shell scroll.
        popover.style.maxHeight = `${Math.max(0, anchorRect.top - VIEWPORT_PADDING)}px`
    }
}

function supportsCssAnchorPositioning(): boolean {
    return typeof CSS !== "undefined" && CSS.supports("anchor-name", "--a") && CSS.supports("position-area", "top")
}
