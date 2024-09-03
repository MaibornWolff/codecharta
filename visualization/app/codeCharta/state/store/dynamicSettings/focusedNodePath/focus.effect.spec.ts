import { TestBed } from "@angular/core/testing"
import { BehaviorSubject } from "rxjs"
import { ThreeMapControlsService } from "../../../../ui/codeMap/threeViewer/threeMapControls.service"
import { focusedNodePathSelector } from "./focusedNodePath.selector"
import { EffectsModule } from "@ngrx/effects"
import { Action } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { provideMockActions } from "@ngrx/effects/testing"
import { FocusEffects } from "./focus.effect"
import { focusNode, unfocusNode, unfocusAllNodes } from "./focusedNodePath.actions"
import { CcState } from "../../../../codeCharta.model"

describe("FocusEffects", () => {
    let actions$: BehaviorSubject<Action>
    let store: MockStore<CcState>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let threeMapControlsService: ThreeMapControlsService

    let mockFocusOnNode: jest.Mock
    let mockUnfocusNode: jest.Mock

    beforeEach(() => {
        actions$ = new BehaviorSubject({ type: "" })
        mockFocusOnNode = jest.fn()
        mockUnfocusNode = jest.fn()

        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([FocusEffects])],
            providers: [
                provideMockActions(() => actions$),
                provideMockStore({
                    selectors: [{ selector: focusedNodePathSelector, value: [] }]
                }),
                { provide: ThreeMapControlsService, useValue: { focusOnNode: mockFocusOnNode, unfocusNode: mockUnfocusNode } }
            ]
        })

        store = TestBed.inject(MockStore)
        threeMapControlsService = TestBed.inject(ThreeMapControlsService)
    })

    afterEach(() => {
        actions$.complete()
    })

    it("should focus on the first node when focusNode action is dispatched", () => {
        store.overrideSelector(focusedNodePathSelector, ["node1"])
        store.refreshState()
        actions$.next(focusNode({ value: "node2" }))

        expect(mockFocusOnNode).toHaveBeenCalledWith("node1")
    })

    it("should unfocus and then focus on the first node when unfocusNode action is dispatched and there are focused nodes", () => {
        store.overrideSelector(focusedNodePathSelector, ["node1", "node2"])
        store.refreshState()
        actions$.next(unfocusNode())

        expect(mockUnfocusNode).toHaveBeenCalled()
        expect(mockFocusOnNode).toHaveBeenCalledWith("node1")
    })

    it("should unfocus map when unfocusAllNodes action is dispatched", () => {
        actions$.next(unfocusAllNodes())

        expect(mockUnfocusNode).toHaveBeenCalled()
    })
})
