import { TestBed } from "@angular/core/testing"
import { Event, NavigationCancel, NavigationCancellationCode, NavigationEnd, NavigationError, Router } from "@angular/router"
import { Subject } from "rxjs"
import { ViewId } from "./routePaths"
import { ViewReadinessStore } from "./viewReadiness.store"
import { VIEW_SWITCH_MAX_WAIT_MS, ViewSwitchProgressStore } from "./viewSwitchProgress.store"

describe("ViewSwitchProgressStore", () => {
    let routerEvents$: Subject<Event>

    function setup({ hasNavigated = true } = {}) {
        routerEvents$ = new Subject<Event>()
        TestBed.configureTestingModule({
            providers: [{ provide: Router, useValue: { events: routerEvents$, navigated: hasNavigated } }]
        })
        const store = TestBed.inject(ViewSwitchProgressStore)
        const viewReadinessStore = TestBed.inject(ViewReadinessStore)
        const pendingViews: (ViewId | null)[] = []
        store.pendingView$.subscribe(view => pendingViews.push(view))
        return { store, viewReadinessStore, pendingViews }
    }

    afterEach(() => {
        jest.useRealTimers()
    })

    it("should report no pending view before any switch", () => {
        // Arrange & Act
        const { pendingViews } = setup()

        // Assert
        expect(pendingViews).toEqual([null])
    })

    it("should show a switch to a view that still has to be built as pending", () => {
        // Arrange
        const { store, pendingViews } = setup()

        // Act
        const isPending = store.announceSwitchTo("domain")

        // Assert
        expect(isPending).toBe(true)
        expect(pendingViews).toEqual([null, "domain"])
    })

    it("should not show a switch to a view that is already built", () => {
        // Arrange
        const { store, viewReadinessStore, pendingViews } = setup()
        viewReadinessStore.markReady("domain")

        // Act
        const isPending = store.announceSwitchTo("domain")

        // Assert
        expect(isPending).toBe(false)
        expect(pendingViews).toEqual([null])
    })

    it("should not show the first navigation, which the boot indicator already covers", () => {
        // Arrange
        const { store, pendingViews } = setup({ hasNavigated: false })

        // Act
        const isPending = store.announceSwitchTo("domain")

        // Assert
        expect(isPending).toBe(false)
        expect(pendingViews).toEqual([null])
    })

    it("should keep the switch pending after the navigation until the view reports ready", () => {
        // Arrange
        const { store, viewReadinessStore, pendingViews } = setup()
        store.announceSwitchTo("domain")

        // Act
        routerEvents$.next(new NavigationEnd(1, "/domain", "/domain"))
        const pendingViewsAfterNavigation = [...pendingViews]
        viewReadinessStore.markReady("domain")

        // Assert
        expect(pendingViewsAfterNavigation).toEqual([null, "domain"])
        expect(pendingViews).toEqual([null, "domain", null])
    })

    it("should not end the switch when the view reports ready before the navigation settled", () => {
        // Arrange
        const { store, viewReadinessStore, pendingViews } = setup()
        store.announceSwitchTo("dependencies")

        // Act
        viewReadinessStore.markReady("dependencies")
        viewReadinessStore.markAllStale()
        routerEvents$.next(new NavigationEnd(1, "/dependencies", "/dependencies"))

        // Assert
        expect(pendingViews).toEqual([null, "dependencies"])
    })

    it.each([
        ["cancelled", new NavigationCancel(1, "/domain", "redirected", NavigationCancellationCode.Redirect)],
        ["failed", new NavigationError(1, "/domain", new Error("chunk failed to load"))]
    ])("should end the switch when the navigation is %s", (_outcome, settlingEvent) => {
        // Arrange
        const { store, pendingViews } = setup()
        store.announceSwitchTo("domain")

        // Act
        routerEvents$.next(settlingEvent)

        // Assert
        expect(pendingViews).toEqual([null, "domain", null])
    })

    it("should end the switch after the backstop when the view never reports ready", () => {
        // Arrange
        jest.useFakeTimers()
        const { store, pendingViews } = setup()
        store.announceSwitchTo("domain")
        routerEvents$.next(new NavigationEnd(1, "/domain", "/domain"))

        // Act
        jest.advanceTimersByTime(VIEW_SWITCH_MAX_WAIT_MS)

        // Assert
        expect(pendingViews).toEqual([null, "domain", null])
    })

    it("should follow the latest switch when a second one supersedes the first", () => {
        // Arrange
        const { store, viewReadinessStore, pendingViews } = setup()
        store.announceSwitchTo("domain")

        // Act
        store.announceSwitchTo("dependencies")
        routerEvents$.next(new NavigationEnd(2, "/dependencies", "/dependencies"))
        viewReadinessStore.markReady("domain")

        // Assert
        expect(pendingViews).toEqual([null, "domain", "dependencies"])
    })
})
