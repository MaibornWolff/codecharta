import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { RouterLink, RouterLinkActive } from "@angular/router"
import { ActiveViewStore } from "../../../../routing/activeView.store"
import { routeLinks, ViewId } from "../../../../routing/routePaths"
import { ViewSwitcherReadStore } from "../../stores/viewSwitcher.read.store"
import { ViewModeBarComponent } from "../viewModeBar/viewModeBar.component"

/** The mode bar floats below the nav bar, so the pointer crosses a seam on its way down into it.
 * Closing on a short delay instead of straight on mouseleave keeps it reachable. */
const CLOSE_MODE_BAR_DELAY_MS = 200

@Component({
    selector: "cc-view-switcher",
    templateUrl: "./viewSwitcher.component.html",
    imports: [RouterLink, RouterLinkActive, ViewModeBarComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    host: { class: "contents" }
})
export class ViewSwitcherComponent {
    private readonly readStore = inject(ViewSwitcherReadStore)
    private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef)

    readonly isDomainViewAvailable = this.readStore.isDomainViewAvailable
    readonly activeView = toSignal(inject(ActiveViewStore).activeView$, { requireSync: true })
    readonly routeLinks = routeLinks

    readonly previewedView = signal<ViewId | null>(null)

    private pendingClose: ReturnType<typeof setTimeout> | null = null

    constructor() {
        inject(DestroyRef).onDestroy(() => this.cancelPendingClose())
    }

    openModeBar(view: ViewId) {
        this.cancelPendingClose()
        this.previewedView.set(view)
    }

    cancelPendingClose() {
        if (this.pendingClose !== null) {
            clearTimeout(this.pendingClose)
            this.pendingClose = null
        }
    }

    scheduleClosingModeBar() {
        this.cancelPendingClose()
        this.pendingClose = setTimeout(() => this.closeModeBar(), CLOSE_MODE_BAR_DELAY_MS)
    }

    closeModeBarWhenFocusLeaves(event: FocusEvent) {
        const nextFocused = event.relatedTarget
        if (!(nextFocused instanceof Node) || !this.hostElement.nativeElement.contains(nextFocused)) {
            this.closeModeBar()
        }
    }

    /** A pick is made, so the bar has served its purpose — and left open under a resting pointer it
     * would keep covering whatever sits below the nav bar. */
    closeModeBar() {
        this.cancelPendingClose()
        this.previewedView.set(null)
    }
}
