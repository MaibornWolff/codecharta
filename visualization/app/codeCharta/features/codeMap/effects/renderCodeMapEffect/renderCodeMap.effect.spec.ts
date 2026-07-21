import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { BehaviorSubject, Subject } from "rxjs"
import { accumulatedDataSelector } from "../../../../renderer/renderModel/accumulatedData/accumulatedData.selector"
import { ThreeRendererService } from "../../../../renderer/threeViewer/threeRenderer.service"
import { ActiveViewStore } from "../../../../routing/activeView.store"
import { ViewId } from "../../../../routing/routePaths"
import { ViewReadinessStore } from "../../../../routing/viewReadiness.store"
import { setInvertArea } from "../../../../stores/mapState/mapState.write.facade"
import { wait } from "../../../../util/testUtils/wait"
import { CodeMapRenderService } from "../../codeMap.render.service"
import { maxFPS, RenderCodeMapEffect } from "./renderCodeMap.effect"

describe("renderCodeMapEffect", () => {
    let actions$: Subject<Action>
    let threeRendererService: ThreeRendererService
    let codeMapRenderService: CodeMapRenderService
    let activeView$: BehaviorSubject<ViewId>
    let viewReadinessStore: ViewReadinessStore

    beforeEach(() => {
        threeRendererService = { render: jest.fn() } as unknown as ThreeRendererService
        codeMapRenderService = { load: jest.fn() } as unknown as CodeMapRenderService
        actions$ = new Subject<Action>()
        activeView$ = new BehaviorSubject<ViewId>("metrics")

        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([RenderCodeMapEffect])],
            providers: [
                { provide: ThreeRendererService, useValue: threeRendererService },
                { provide: CodeMapRenderService, useValue: codeMapRenderService },
                { provide: ActiveViewStore, useValue: { activeView$ } },
                provideMockStore({ selectors: [{ selector: accumulatedDataSelector, value: { unifiedMapNode: {} } }] }),
                provideMockActions(() => actions$)
            ]
        })

        viewReadinessStore = TestBed.inject(ViewReadinessStore)
        TestBed.inject(RenderCodeMapEffect)
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
})
