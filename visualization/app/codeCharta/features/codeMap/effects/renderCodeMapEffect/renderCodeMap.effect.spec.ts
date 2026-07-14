import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { Subject } from "rxjs"
import { accumulatedDataSelector } from "../../../../renderer/renderModel/accumulatedData/accumulatedData.selector"
import { ThreeRendererService } from "../../../../renderer/threeViewer/threeRenderer.service"
import { setInvertArea } from "../../../../stores/mapState/mapState.write.facade"
import { wait } from "../../../../util/testUtils/wait"
import { CodeMapRenderService } from "../../codeMap.render.service"
import { maxFPS, RenderCodeMapEffect } from "./renderCodeMap.effect"

describe("renderCodeMapEffect", () => {
    let actions$: Subject<Action>
    let threeRendererService: ThreeRendererService
    let codeMapRenderService: CodeMapRenderService

    beforeEach(() => {
        threeRendererService = { render: jest.fn() } as unknown as ThreeRendererService
        codeMapRenderService = { load: jest.fn() } as unknown as CodeMapRenderService
        actions$ = new Subject<Action>()

        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([RenderCodeMapEffect])],
            providers: [
                { provide: ThreeRendererService, useValue: threeRendererService },
                { provide: CodeMapRenderService, useValue: codeMapRenderService },
                provideMockStore({ selectors: [{ selector: accumulatedDataSelector, value: { unifiedMapNode: {} } }] }),
                provideMockActions(() => actions$)
            ]
        })

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
})
