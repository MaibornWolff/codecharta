import { FILE_STATES, FILE_STATES_WITHOUT_EDGES } from "../../../../util/dataMocks"
import { sortedNodeEdgeMetricsMapSelector } from "./sortedNodeEdgeMetricsMap.selector"
import { Store, StoreModule } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { TestBed } from "@angular/core/testing"
import { appReducers } from "../../../store/state.manager"
import { setFiles } from "../../../store/files/files.actions"
import { NodeEdgeMetricsMap } from "./edgeMetricData.calculator"
import { firstValueFrom } from "rxjs"

describe("sortedNodeEdgeMetricsMapSelector", () => {
    let store: Store<CcState>

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot(appReducers)]
        })
        store = TestBed.inject(Store)
    })

    afterEach(() => {
        sortedNodeEdgeMetricsMapSelector.release()
        TestBed.resetTestingModule()
    })

    it("should return a sorted map of node edge metrics", async () => {
        store.dispatch(setFiles({ value: FILE_STATES }))

        const result: NodeEdgeMetricsMap = await firstValueFrom(store.select(sortedNodeEdgeMetricsMapSelector))

        expect(result.get("pairingRate")).toEqual(
            new Map([
                ["/root/Parent Leaf/small leaf", { incoming: 2, outgoing: 0 }],
                ["/root/big leaf", { incoming: 0, outgoing: 1 }],
                ["/root/Parent Leaf/other small leaf", { incoming: 0, outgoing: 1 }]
            ])
        )
        expect(result.get("avgCommits")).toEqual(
            new Map([
                ["/root/Parent Leaf/small leaf", { incoming: 1, outgoing: 0 }],
                ["/root/big leaf", { incoming: 0, outgoing: 1 }]
            ])
        )
        expect(result.get("otherMetric")).toEqual(
            new Map([
                ["/root/Parent Leaf/other small leaf", { incoming: 0, outgoing: 1 }],
                ["/root/Parent Leaf/small leaf", { incoming: 1, outgoing: 0 }]
            ])
        )
    })

    it("should return an empty map if there are no edges", async () => {
        store.dispatch(setFiles({ value: FILE_STATES_WITHOUT_EDGES }))

        const result: NodeEdgeMetricsMap = await firstValueFrom(store.select(sortedNodeEdgeMetricsMapSelector))

        expect(result).toEqual(new Map())
    })
})
