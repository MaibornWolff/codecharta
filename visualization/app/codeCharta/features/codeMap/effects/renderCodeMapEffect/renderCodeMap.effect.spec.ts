import { ErrorHandler } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { BehaviorSubject, Subject } from "rxjs"
import { CodeMapNode } from "../../../../model/codeCharta.model"
import { AccumulatedData, accumulatedDataSelector } from "../../../../renderer/renderModel/accumulatedData/accumulatedData.selector"
import { ThreeRendererService } from "../../../../renderer/threeViewer/threeRenderer.service"
import { ThreeViewerService } from "../../../../renderer/threeViewer/threeViewer.service"
import { ActiveViewStore } from "../../../../routing/activeView.store"
import { ViewId } from "../../../../routing/routePaths"
import { ViewReadinessStore } from "../../../../routing/viewReadiness.store"
import { setInvertArea } from "../../../../stores/mapState/mapState.write.facade"
import { wait } from "../../../../util/testUtils/wait"
import { CodeMapRenderService } from "../../codeMap.render.service"
import { maxFPS, RenderCodeMapEffect } from "./renderCodeMap.effect"

const NO_MAP_DATA: AccumulatedData = { unifiedMapNode: undefined, unifiedFileMeta: undefined }
const LOADED_MAP_DATA: AccumulatedData = { unifiedMapNode: {} as CodeMapNode, unifiedFileMeta: undefined }

describe("renderCodeMapEffect", () => {
    let actions$: Subject<Action>
    let threeRendererService: ThreeRendererService
    let codeMapRenderService: CodeMapRenderService
    let activeView$: BehaviorSubject<ViewId>
    let viewReadinessStore: ViewReadinessStore
    let errorHandler: ErrorHandler
    let store: MockStore
    let isMapCanvasMounted$: BehaviorSubject<boolean>

    beforeEach(() => {
        threeRendererService = { render: jest.fn() } as unknown as ThreeRendererService
        errorHandler = { handleError: jest.fn() }
        codeMapRenderService = { load: jest.fn() } as unknown as CodeMapRenderService
        actions$ = new Subject<Action>()
        activeView$ = new BehaviorSubject<ViewId>("metrics")
        isMapCanvasMounted$ = new BehaviorSubject(true)

        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([RenderCodeMapEffect])],
            providers: [
                { provide: ThreeRendererService, useValue: threeRendererService },
                { provide: CodeMapRenderService, useValue: codeMapRenderService },
                { provide: ThreeViewerService, useValue: { isMapCanvasMounted$ } },
                { provide: ActiveViewStore, useValue: { activeView$ } },
                { provide: ErrorHandler, useValue: errorHandler },
                provideMockStore({ selectors: [{ selector: accumulatedDataSelector, value: NO_MAP_DATA }] }),
                provideMockActions(() => actions$)
            ]
        })

        viewReadinessStore = TestBed.inject(ViewReadinessStore)
        store = TestBed.inject(MockStore)
        TestBed.inject(RenderCodeMapEffect)

        // the files land after the app has started, the order every session sees
        store.overrideSelector(accumulatedDataSelector, LOADED_MAP_DATA)
        store.refreshState()
    })

    afterEach(() => {
        actions$.complete()
    })

    it("should drive the renderer load seam throttled after actions requiring rerender", async () => {
        // Act
        actions$.next(setInvertArea({ value: true }))
        actions$.next(setInvertArea({ value: true }))

        // Assert
        expect(codeMapRenderService.load).toHaveBeenCalledTimes(0)
        expect(threeRendererService.render).toHaveBeenCalledTimes(0)

        await wait(maxFPS)
        expect(codeMapRenderService.load).toHaveBeenCalledTimes(1)
        expect(threeRendererService.render).toHaveBeenCalledTimes(1)
    })

    it("should not build the map while the metrics view is off screen", async () => {
        // Arrange — the user is working in the domain view
        activeView$.next("domain")

        // Act
        actions$.next(setInvertArea({ value: true }))
        await wait(maxFPS)

        // Assert — rebuilding a map nobody can see would only make the domain view wait
        expect(codeMapRenderService.load).not.toHaveBeenCalled()
    })

    it("should build the deferred map as soon as the metrics view is shown again", async () => {
        // Arrange — a change happened while the user was in the domain view
        activeView$.next("domain")
        actions$.next(setInvertArea({ value: true }))
        await wait(maxFPS)

        // Act
        activeView$.next("metrics")
        await wait(maxFPS)

        // Assert
        expect(codeMapRenderService.load).toHaveBeenCalledTimes(1)
        expect(threeRendererService.render).toHaveBeenCalledTimes(1)
    })

    it("should not rebuild an already current map when the metrics view is shown again", async () => {
        // Arrange — the map rendered, and nothing changed while the user was away
        actions$.next(setInvertArea({ value: true }))
        await wait(maxFPS)
        viewReadinessStore.markReady("metrics")

        // Act
        activeView$.next("domain")
        activeView$.next("metrics")
        await wait(maxFPS)

        // Assert
        expect(codeMapRenderService.load).toHaveBeenCalledTimes(1)
    })

    it("should keep re-rendering on-screen changes after the map has settled to ready", async () => {
        // Arrange — the map rendered once and settled, exactly the state the app is in when the user has
        actions$.next(setInvertArea({ value: true }))
        await wait(maxFPS)
        viewReadinessStore.markReady("metrics")

        // Act — a further render-affecting change while still on the metrics view
        actions$.next(setInvertArea({ value: false }))
        await wait(maxFPS)

        // Assert — the change is drawn; gating this render on staleness left the spinner stuck forever
        expect(codeMapRenderService.load).toHaveBeenCalledTimes(2)
        expect(threeRendererService.render).toHaveBeenCalledTimes(2)
    })

    it("should build the map on the first arrival of a session that started in another view", async () => {
        // Arrange — a session deep-linked to the domain view: the files are loaded, but nothing has
        // dispatched a re-render action, so there is no action to pair the map data with
        activeView$.next("domain")

        // Act
        activeView$.next("metrics")
        await wait(maxFPS)

        // Assert — without this the view stays stale and its spinner never clears
        expect(codeMapRenderService.load).toHaveBeenCalledTimes(1)
        expect(threeRendererService.render).toHaveBeenCalledTimes(1)
    })

    it("should report a failed render and keep rendering, rather than take the stream down with it", async () => {
        // Arrange — the first render throws, e.g. on a scene that is not set up yet
        const renderFailure = new Error("render failed")
        ;(codeMapRenderService.load as jest.Mock).mockImplementationOnce(() => {
            throw renderFailure
        })
        actions$.next(setInvertArea({ value: true }))
        await wait(maxFPS)

        // Act — the user leaves and comes back to the still stale view
        activeView$.next("domain")
        activeView$.next("metrics")
        await wait(maxFPS)

        // Assert — the failure is reported, and the map is built on the next occasion
        expect(errorHandler.handleError).toHaveBeenCalledWith(renderFailure)
        expect(codeMapRenderService.load).toHaveBeenCalledTimes(2)
    })

    it("should let the view settle after a failed render, so its spinner cannot outlive the failure", async () => {
        // Arrange
        ;(codeMapRenderService.load as jest.Mock).mockImplementationOnce(() => {
            throw new Error("render failed")
        })
        const renders = jest.fn()
        TestBed.inject(RenderCodeMapEffect).renderCodeMap$.subscribe(renders)

        // Act
        actions$.next(setInvertArea({ value: true }))
        await wait(maxFPS)

        // Assert — readiness hangs off this emission, so a failed render must still produce one
        expect(renders).toHaveBeenCalledTimes(1)
    })

    it("should wait for the metrics view to mount its canvas before building a deferred map", async () => {
        // Arrange — the metrics view has never been shown, so its canvas does not exist yet
        isMapCanvasMounted$.next(false)
        activeView$.next("domain")

        // Act
        activeView$.next("metrics")
        await wait(maxFPS)

        // Assert — building the map into a canvas that is not there throws where the floor labels
        // measure it, which used to end the render stream and strand the view's spinner
        expect(codeMapRenderService.load).not.toHaveBeenCalled()

        // Act — the view mounts
        isMapCanvasMounted$.next(true)
        await wait(maxFPS)

        // Assert
        expect(codeMapRenderService.load).toHaveBeenCalledTimes(1)
    })
})
