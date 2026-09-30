import { TestBed } from "@angular/core/testing"
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router"
import { routePaths, ViewId } from "./routePaths"
import { showSpinnerBeforeBuildingView } from "./showSpinnerBeforeBuildingView.guard"
import { ViewSwitchProgressStore } from "./viewSwitchProgress.store"

describe("showSpinnerBeforeBuildingView", () => {
    let announceSwitchTo: jest.Mock<boolean, [ViewId]>

    function runGuardFor(routePath: string) {
        const route = { routeConfig: { path: routePath } } as unknown as ActivatedRouteSnapshot
        return TestBed.runInInjectionContext(() => showSpinnerBeforeBuildingView(route, {} as RouterStateSnapshot))
    }

    function setup({ hasToBuildView }: { hasToBuildView: boolean }) {
        announceSwitchTo = jest.fn((_view: ViewId) => hasToBuildView)
        TestBed.configureTestingModule({ providers: [{ provide: ViewSwitchProgressStore, useValue: { announceSwitchTo } }] })
    }

    afterEach(() => {
        jest.useRealTimers()
    })

    it("should announce the switch to the view of the activated route", () => {
        // Arrange
        setup({ hasToBuildView: false })

        // Act
        runGuardFor(routePaths.dependencies)

        // Assert
        expect(announceSwitchTo).toHaveBeenCalledWith("dependencies")
    })

    it("should let a switch to an already built view through at once", () => {
        // Arrange
        setup({ hasToBuildView: false })

        // Act
        const canActivate = runGuardFor(routePaths.domain)

        // Assert
        expect(canActivate).toBe(true)
    })

    it("should hold a switch to a view still to be built until the spinner has been painted", async () => {
        // Arrange
        jest.useFakeTimers()
        setup({ hasToBuildView: true })
        let hasActivated = false

        // Act
        const canActivate = runGuardFor(routePaths.domain) as Promise<boolean>
        void canActivate.then(() => (hasActivated = true))
        jest.advanceTimersToNextFrame()
        await Promise.resolve()
        const hasActivatedAfterFirstFrame = hasActivated
        jest.advanceTimersToNextFrame()

        // Assert
        expect(hasActivatedAfterFirstFrame).toBe(false)
        expect(await canActivate).toBe(true)
    })
})
