import { TestBed } from "@angular/core/testing"
import { Store, StoreModule } from "@ngrx/store"
import { firstValueFrom } from "rxjs"
import { DEFAULT_STATE, FILE_STATES } from "../../../mocks/dataMocks"
import { CcState } from "../../../model/codeCharta.model"
import { setFiles } from "../../../stores/fileStore/store/files.actions"
import { setEdgeMetric, setShowIncomingEdges, setShowOutgoingEdges } from "../../../stores/mapState/mapState.write.facade"
import { setState } from "../../../stores/rootStore/state.actions"
import { appReducers } from "../../../stores/rootStore/store"
import { amountOfBuildingsWithSelectedEdgeMetricSelector } from "./amountOfBuildingsWithSelectedEdgeMetric.selector"

describe("countBuildingsWithEdgeMetric", () => {
    let store: Store<CcState>

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot(appReducers)]
        })
        store = TestBed.inject(Store)
        store.dispatch(setState({ value: DEFAULT_STATE }))
        store.dispatch(setEdgeMetric({ value: "pairingRate" }))
    })

    afterEach(() => {
        amountOfBuildingsWithSelectedEdgeMetricSelector.release()
        TestBed.resetTestingModule()
    })

    it("should count number of buildings correct", async () => {
        store.dispatch(setFiles({ value: FILE_STATES }))

        const result = await firstValueFrom(store.select(amountOfBuildingsWithSelectedEdgeMetricSelector))

        expect(result).toBe(3)
    })

    it("should count number of buildings correct when outgoing edges are disabled", async () => {
        store.dispatch(setFiles({ value: FILE_STATES }))
        store.dispatch(setEdgeMetric({ value: "pairingRate" }))
        store.dispatch(setShowOutgoingEdges({ value: false }))

        const result = await firstValueFrom(store.select(amountOfBuildingsWithSelectedEdgeMetricSelector))

        expect(result).toBe(1)
    })

    it("should count number of buildings correct when incoming edges are disabled", async () => {
        store.dispatch(setFiles({ value: FILE_STATES }))
        store.dispatch(setEdgeMetric({ value: "pairingRate" }))
        store.dispatch(setShowIncomingEdges({ value: false }))

        const result = await firstValueFrom(store.select(amountOfBuildingsWithSelectedEdgeMetricSelector))

        expect(result).toBe(2)
    })

    it("should return 0 when incoming and outgoing edges are disabled", async () => {
        store.dispatch(setFiles({ value: FILE_STATES }))
        store.dispatch(setEdgeMetric({ value: "pairingRate" }))
        store.dispatch(setShowIncomingEdges({ value: false }))
        store.dispatch(setShowOutgoingEdges({ value: false }))

        const result = await firstValueFrom(store.select(amountOfBuildingsWithSelectedEdgeMetricSelector))

        expect(result).toBe(0)
    })
})
