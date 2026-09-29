import { ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, Signal, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { RouterLink, RouterLinkActive } from "@angular/router"
import { ActiveViewStore } from "../../../../routing/activeView.store"
import { routeLinks, ViewId } from "../../../../routing/routePaths"
import { ViewSwitcherReadStore } from "../../stores/viewSwitcher.read.store"
import { ViewModeBarComponent } from "../viewModeBar/viewModeBar.component"

/** The mode bar floats below the nav bar, so the pointer crosses a seam on its way down into it.
 * Closing on a short delay instead of straight on mouseleave keeps it reachable. */
const CLOSE_MODE_BAR_DELAY_MS = 200

interface ViewTab {
    view: ViewId
    label: string
    title: string
    /** The metrics route is the empty default path, which every other route would otherwise match too. */
    matchesExactly: boolean
}

const VIEW_TABS: readonly ViewTab[] = [
    { view: "metrics", label: "Metric", title: "Show the 3D metrics map", matchesExactly: true },
    { view: "domain", label: "Domain", title: "Show the domain-language word cloud", matchesExactly: false },
    { view: "dependencies", label: "Dependencies", title: "Show the dependency graph, arranged by level", matchesExactly: false }
]

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

    private readonly isViewAvailable: Record<ViewId, Signal<boolean>> = {
        metrics: signal(true),
        domain: this.readStore.isDomainViewAvailable,
        dependencies: this.readStore.isDependencyViewAvailable
    }
    readonly availableTabs = computed(() => VIEW_TABS.filter(tab => this.isViewAvailable[tab.view]()))
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
