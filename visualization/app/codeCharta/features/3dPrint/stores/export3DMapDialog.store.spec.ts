import { TestBed } from "@angular/core/testing"
import { Router } from "@angular/router"
import { BehaviorSubject, Observable, of } from "rxjs"
import { ColorMode } from "../../../model/codeCharta.model"
import { ActiveViewStore } from "../../../routing/activeView.store"
import { routeLinks, ViewId } from "../../../routing/routePaths"
import { ViewReadinessStore } from "../../../routing/viewReadiness.store"
import { ErrorDialogData } from "../../../util/errorDialog/errorDialog.model"
import { ErrorDialogService } from "../../../util/errorDialog/errorDialog.service"
import { Export3DColorModeStore } from "./colorMode.store"
import { Export3DMapDialogStore } from "./export3DMapDialog.store"

describe("Export3DMapDialogStore", () => {
    let colorModeStore: { getColorMode: jest.Mock; setAbsoluteColorMode: jest.Mock; colorMode$: Observable<ColorMode> }
    let errorDialogService: { open: jest.Mock }
    let router: { navigateByUrl: jest.Mock }
    let activeView: ViewId
    let isMetricsViewStale: BehaviorSubject<boolean>

    function setup(colorMode: ColorMode, view: ViewId = "metrics", hasNavigationSucceeded = true) {
        colorModeStore = {
            getColorMode: jest.fn(() => colorMode),
            setAbsoluteColorMode: jest.fn(),
            colorMode$: of(ColorMode.absolute)
        }
        errorDialogService = { open: jest.fn() }
        activeView = view
        isMetricsViewStale = new BehaviorSubject(false)
        router = {
            navigateByUrl: jest.fn(() => {
                activeView = hasNavigationSucceeded ? "metrics" : activeView
                return Promise.resolve(hasNavigationSucceeded)
            })
        }
        TestBed.configureTestingModule({
            providers: [
                { provide: Export3DColorModeStore, useValue: colorModeStore },
                { provide: ErrorDialogService, useValue: errorDialogService },
                { provide: Router, useValue: router },
                { provide: ActiveViewStore, useValue: { currentView: () => activeView } },
                { provide: ViewReadinessStore, useValue: { isStale$: () => isMetricsViewStale } }
            ]
        })
        return TestBed.inject(Export3DMapDialogStore)
    }

    const openedDialogData = () => errorDialogService.open.mock.calls[0][0] as ErrorDialogData

    it("should open the dialog when the color mode is absolute", () => {
        // Arrange
        const store = setup(ColorMode.absolute)

        // Act
        store.requestExport()

        // Assert
        expect(store.isDialogOpen()).toBe(true)
        expect(errorDialogService.open).not.toHaveBeenCalled()
    })

    it("should explain the wrong color mode instead of opening the dialog", () => {
        // Arrange
        const store = setup(ColorMode.weightedGradient)

        // Act
        store.requestExport()

        // Assert
        expect(store.isDialogOpen()).toBe(false)
        expect(errorDialogService.open).toHaveBeenCalledWith(expect.objectContaining({ title: "Map could not be exported" }))
    })

    it("should switch to absolute color mode and open the dialog when the error is resolved", () => {
        // Arrange
        jest.useFakeTimers()
        const store = setup(ColorMode.weightedGradient)
        store.requestExport()

        // Act
        openedDialogData().resolveErrorData.onResolveErrorClick()
        jest.runAllTimers()

        // Assert
        expect(colorModeStore.setAbsoluteColorMode).toHaveBeenCalledTimes(1)
        expect(store.isDialogOpen()).toBe(true)
        jest.useRealTimers()
    })

    it("should offer to switch views instead of exporting from another view", async () => {
        // Arrange
        const store = setup(ColorMode.absolute, "domain")

        // Act
        store.requestExport()

        // Assert — the export reads the rendered code map, which only the metric view mounts
        expect(store.isDialogOpen()).toBe(false)
        expect(openedDialogData().title).toBe("3D export needs the Metric view")
        expect(openedDialogData().resolveErrorData.buttonText).toBe("Switch and continue")
    })

    it("should switch to the metric view and open the dialog once the map is rendered", async () => {
        // Arrange
        const store = setup(ColorMode.absolute, "domain")
        store.requestExport()
        isMetricsViewStale.next(true)

        // Act
        openedDialogData().resolveErrorData.onResolveErrorClick()
        await Promise.resolve()

        // Assert — opening before the render leaves the export without a map mesh to read
        expect(router.navigateByUrl).toHaveBeenCalledWith(routeLinks.metrics)
        expect(store.isDialogOpen()).toBe(false)

        // Act
        isMetricsViewStale.next(false)

        // Assert
        expect(store.isDialogOpen()).toBe(true)
    })

    it("should keep the wrong color mode blocking the export after the view switch", async () => {
        // Arrange
        const store = setup(ColorMode.weightedGradient, "domain")
        store.requestExport()

        // Act
        openedDialogData().resolveErrorData.onResolveErrorClick()
        await Promise.resolve()

        // Assert — both preconditions still have to hold, so the color mode prompt takes over
        expect(store.isDialogOpen()).toBe(false)
        expect(errorDialogService.open).toHaveBeenLastCalledWith(expect.objectContaining({ title: "Map could not be exported" }))
    })

    it("should not open the dialog when the view switch is refused", async () => {
        // Arrange — a guard can send the navigation elsewhere, leaving no map to export
        const store = setup(ColorMode.absolute, "domain", false)
        store.requestExport()

        // Act
        openedDialogData().resolveErrorData.onResolveErrorClick()
        await Promise.resolve()

        // Assert
        expect(store.isDialogOpen()).toBe(false)
    })

    it("should close the dialog again", () => {
        // Arrange
        const store = setup(ColorMode.absolute)
        store.requestExport()

        // Act
        store.closeDialog()

        // Assert
        expect(store.isDialogOpen()).toBe(false)
    })
})
