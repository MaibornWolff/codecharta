import { TestBed } from "@angular/core/testing"
import { BehaviorSubject } from "rxjs"
import { ThreeMapControlsService } from "../../../ui/codeMap/threeViewer/threeMapControls.service"
import { focusNode, unfocusAllNodes, unfocusNode } from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { FocusEffects } from "./focus.effect"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { provideMockActions } from "@ngrx/effects/testing"
import { CcState, DynamicSettings } from "../../../codeCharta.model"
import { currentFocusedNodePathSelector } from "../../store/dynamicSettings/focusedNodePath/currentFocused.selector"
import { focusedNodePathSelector } from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.selector"
import { isChildPath } from "../../../util/isChildPath"
import { EffectsModule } from "@ngrx/effects"
import { Action } from "@ngrx/store"

jest.mock("../../../util/isChildPath", () => ({
    isChildPath: jest.fn()
}))
const mockIsChildPath = isChildPath as jest.Mock

describe("FocusEffects", () => {
    let actions$: BehaviorSubject<Action>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let effects: FocusEffects
    let store: MockStore<CcState>
    let threeMapControlsService: ThreeMapControlsService

    const initialState: CcState = {
        dynamicSettings: {
            focusedNodePath: []
        } as unknown as DynamicSettings
    } as unknown as CcState

    beforeEach(() => {
        actions$ = new BehaviorSubject<Action>({ type: "" })
        threeMapControlsService = {
            focusNode: jest.fn(),
            unfocusNode: jest.fn()
        } as unknown as ThreeMapControlsService

        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([FocusEffects])],
            providers: [
                FocusEffects,
                provideMockActions(() => actions$),
                provideMockStore({
                    initialState,
                    selectors: [
                        { selector: currentFocusedNodePathSelector, value: "previous/node/path" },
                        { selector: focusedNodePathSelector, value: [] }
                    ]
                }),
                { provide: ThreeMapControlsService, useValue: threeMapControlsService }
            ]
        })

        effects = TestBed.inject(FocusEffects)
        store = TestBed.inject(MockStore)
    })

    afterEach(() => {
        actions$.complete()
    })

    describe("focusNode$", () => {
        it("should unfocus current node and then focus on new node if new path is not a child path of previous", () => {
            mockIsChildPath.mockReturnValue(false)

            store.overrideSelector(currentFocusedNodePathSelector, "new/node/path")
            store.refreshState()
            actions$.next(focusNode({ value: "new/node/path" }))

            expect(threeMapControlsService.unfocusNode).toHaveBeenCalledWith(expect.any(Function))
        })

        it("should directly focus on new node if new path is a child path of previous", () => {
            mockIsChildPath.mockReturnValue(true)

            store.overrideSelector(currentFocusedNodePathSelector, "previous/node/path/child")
            store.refreshState()
            actions$.next(focusNode({ value: "previous/node/path/child" }))

            expect(threeMapControlsService.unfocusNode).not.toHaveBeenCalled()
            expect(threeMapControlsService.focusNode).toHaveBeenCalledWith("previous/node/path/child")
        })
    })

    describe("unfocus$", () => {
        it("should unfocus currently focused node and then focus on the first element if focusedNodePath is not empty", () => {
            store.overrideSelector(focusedNodePathSelector, ["some/node/path"])
            store.overrideSelector(currentFocusedNodePathSelector, "some/node/path")
            store.refreshState()

            actions$.next(unfocusNode())

            expect(threeMapControlsService.unfocusNode).toHaveBeenCalled()
            expect(threeMapControlsService.focusNode).toHaveBeenCalledWith("some/node/path")
        })

        it("should unfocus all nodes if focusedNodePath is empty", () => {
            store.overrideSelector(focusedNodePathSelector, [])
            store.overrideSelector(currentFocusedNodePathSelector, null)
            store.refreshState()

            actions$.next(unfocusNode())

            expect(threeMapControlsService.unfocusNode).toHaveBeenCalled()
            expect(threeMapControlsService.focusNode).not.toHaveBeenCalled()
        })
    })

    describe("unfocusAll$", () => {
        it("should unfocus all nodes", () => {
            actions$.next(unfocusAllNodes())

            expect(threeMapControlsService.unfocusNode).toHaveBeenCalled()
        })
    })
})
