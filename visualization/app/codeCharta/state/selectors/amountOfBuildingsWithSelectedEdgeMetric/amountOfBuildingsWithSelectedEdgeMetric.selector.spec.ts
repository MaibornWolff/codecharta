import { TestBed } from "@angular/core/testing"
import { Store, StoreModule } from "@ngrx/store"
import { appReducers } from "../../store/state.manager"
import { firstValueFrom } from "rxjs"
import { amountOfBuildingsWithSelectedEdgeMetricSelector } from "./amountOfBuildingsWithSelectedEdgeMetric.selector"
import { setFiles } from "../../store/files/files.actions"
import { DEFAULT_STATE, FILE_STATES } from "../../../util/dataMocks"
import { CcState } from "../../../codeCharta.model"
import { setState } from "../../store/state.actions"
import { setEdgeMetric } from "../../store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { setShowOutgoingEdges } from "../../store/appSettings/showEdges/outgoing/showOutgoingEdges.actions"
import { setShowIncomingEdges } from "../../store/appSettings/showEdges/incoming/showIncomingEdges.actions"

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
