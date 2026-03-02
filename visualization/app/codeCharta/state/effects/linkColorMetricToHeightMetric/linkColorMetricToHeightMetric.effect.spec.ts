import { TestBed } from "@angular/core/testing"
import { BehaviorSubject } from "rxjs"
import { heightAndLinkedSelector, LinkColorMetricToHeightMetricEffect } from "./linkColorMetricToHeightMetric.effect"
import { setColorMetric } from "../../store/dynamicSettings/colorMetric/colorMetric.actions"
import { EffectsModule } from "@ngrx/effects"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { Action } from "@ngrx/store"
import { provideMockActions } from "@ngrx/effects/testing"
import { getLastAction } from "../../../util/testUtils/store.utils"

describe("linkHeightAndColorMetricEffect", () => {
    let actions$: BehaviorSubject<Action>
    let store: MockStore

    beforeEach(() => {
        actions$ = new BehaviorSubject({ type: "" })
        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([LinkColorMetricToHeightMetricEffect])],
            providers: [
                provideMockStore({
                    selectors: [{ selector: heightAndLinkedSelector, value: { heightMetric: "loc", isLinked: true } }]
                }),
                provideMockActions(() => actions$)
            ]
        })
        store = TestBed.inject(MockStore)
    })

    afterEach(() => {
        actions$.complete()
    })

    it("should not set color metric when height metric changes but height and color metric are not linked", async () => {
        // Arrange & Act
        store.overrideSelector(heightAndLinkedSelector, { heightMetric: "rloc", isLinked: false })
        store.refreshState()

        // Assert
        expect(await getLastAction(store)).toEqual({ type: "@ngrx/effects/init" })
    })

    it("should set color metric to the same height metric when height metric changes and height and color metric are linked", async () => {
        // Arrange & Act
        store.overrideSelector(heightAndLinkedSelector, { heightMetric: "rloc", isLinked: true })
        store.refreshState()

        // Assert
        expect(await getLastAction(store)).toEqual(setColorMetric({ value: "rloc" }))
    })

    it("should not set color metric when both height metric and linked flag change to unlinked simultaneously", async () => {
        // Arrange – trigger an initial emission so we have a known last action
        store.overrideSelector(heightAndLinkedSelector, { heightMetric: "rloc", isLinked: true })
        store.refreshState()
        expect(await getLastAction(store)).toEqual(setColorMetric({ value: "rloc" }))

        // Act – atomically switch to a new height metric AND unlink
        store.overrideSelector(heightAndLinkedSelector, { heightMetric: "mcc", isLinked: false })
        store.refreshState()

        // Assert – no glitch: the effect should NOT dispatch setColorMetric("mcc"),
        // so the last action remains the previous one
        expect(await getLastAction(store)).toEqual(setColorMetric({ value: "rloc" }))
    })
})
