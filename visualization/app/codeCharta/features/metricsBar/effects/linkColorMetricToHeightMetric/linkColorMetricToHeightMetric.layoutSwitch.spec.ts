import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { State, Store, StoreModule } from "@ngrx/store"
import { TEST_FILE_DATA } from "../../../../mocks/dataMocks"
import { CcState, LayoutAlgorithm, RecursivePartial } from "../../../../model/codeCharta.model"
import { addFile, setStandard } from "../../../../stores/fileStore/store/files.actions"
import { setLayoutAlgorithm } from "../../../../stores/mapState/mapState.write.facade"
import { setState } from "../../../../stores/rootStore/state.actions"
import { appReducers, setStateMiddleware } from "../../../../stores/rootStore/store"
import { ResetColorRangeEffect } from "../resetColorRange/resetColorRange.effect"
import { LinkColorMetricToHeightMetricEffect } from "./linkColorMetricToHeightMetric.effect"

describe("LinkColorMetricToHeightMetricEffect when the layout switches", () => {
    let store: Store<CcState>
    let state: State<CcState>

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] }),
                EffectsModule.forRoot([LinkColorMetricToHeightMetricEffect, ResetColorRangeEffect])
            ]
        })
        store = TestBed.inject(Store)
        state = TestBed.inject(State)
        store.dispatch(addFile({ file: TEST_FILE_DATA }))
        store.dispatch(setStandard({ files: [TEST_FILE_DATA] }))
    })

    async function dispatchAndSettle(patch: RecursivePartial<CcState>) {
        store.dispatch(setState({ value: patch }))
        await settleEffects()
    }

    async function settleEffects() {
        await new Promise(resolve => setTimeout(resolve))
    }

    it.each([
        LayoutAlgorithm.Sunburst,
        LayoutAlgorithm.RadialTreeMap
    ])("should keep the color metric and range of a linked setup after switching to %s and back", async radialLayout => {
        // Arrange
        await dispatchAndSettle({
            mapState: { heightMetric: "mcc", colorMetric: "mcc" },
            preferences: { isColorMetricLinkedToHeightMetric: true }
        })
        await dispatchAndSettle({ mapState: { colorRange: { from: 50, to: 100 } } })

        // Act
        store.dispatch(setLayoutAlgorithm({ value: radialLayout }))
        await settleEffects()
        store.dispatch(setLayoutAlgorithm({ value: LayoutAlgorithm.SquarifiedTreeMap }))
        await settleEffects()

        // Assert
        const { colorMetric, colorRange } = state.getValue().mapState
        expect(colorMetric).toBe("mcc")
        expect(colorRange).toEqual({ from: 50, to: 100 })
    })
})
