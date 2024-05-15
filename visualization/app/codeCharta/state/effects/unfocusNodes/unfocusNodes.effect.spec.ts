import { TestBed } from "@angular/core/testing"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { unfocusAllNodes } from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { UnfocusNodesEffect } from "./unfocusNodes.effect"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { FILE_STATES } from "../../../util/dataMocks"
import { getLastAction } from "../../../util/testUtils/store.utils"
import { EffectsModule } from "@ngrx/effects"

describe("UnfocusNodesEffect", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([UnfocusNodesEffect])],
            providers: [provideMockStore({ selectors: [{ selector: visibleFileStatesSelector, value: [] }] })]
        })
    })

    it("should unfocus all nodes on visible file state changes", async () => {
        const store = TestBed.inject(MockStore)
        store.overrideSelector(visibleFileStatesSelector, FILE_STATES)
        store.refreshState()
        expect(await getLastAction(store)).toEqual(unfocusAllNodes())
    })
})
