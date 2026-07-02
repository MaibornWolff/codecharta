import { TestBed } from "@angular/core/testing"
import { visibleFileStatesSelector } from "../../../fileStore/store/visibleFileStates.selector"
import { unfocusAllNodes } from "../../../sharedView/sharedView.facade"
import { UnfocusNodesEffect } from "./unfocusNodes.effect"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { FILE_STATES } from "../../../mocks/dataMocks"
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
